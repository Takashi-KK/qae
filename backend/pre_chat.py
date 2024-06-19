import os
import traceback
from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple, Union
from unittest.mock import MagicMock

import toml
from dotenv import load_dotenv
from flask import current_app
from openai import AzureOpenAI, OpenAI
from openai.types.chat import (
    ChatCompletion,
    ChatCompletionMessageParam,
    ChatCompletionSystemMessageParam,
    ChatCompletionUserMessageParam,
)

from pre_openai_mock import get_response

LLM_AZURE_MODEL = "gpt-35-turbo"
LLM_MODEL = "openai-gpt-3.5"
# LLM_MODEL = "gpt-3.5-turbo"
QA_LOGFILE_EXTENSION = ".toml"


@dataclass
class RequestData:
    system_content: str
    user_content: str
    temperature: float
    prompt_class: str
    user_id: str


@dataclass
class ResponseData:
    finish_reason: str
    content: str | None
    completion_tokens: int
    prompt_tokens: int
    qa_id: str
    lines: int
    prompt_class: str
    temperature: float


@dataclass
class ResponseErrorData:
    error: str
    detail: str


@dataclass
class Model:
    name: str | None
    llm_service: str | None
    deployment_name: str | None
    api_key: str | None
    api_version: Optional[str] = None
    azure_endpoint: Optional[str] = None


def get_current_datetime() -> str:
    now = datetime.now()
    formatted_datetime = now.strftime("%Y%m%d_%H%M%S")
    return formatted_datetime


def load_toml(file_path: str) -> Dict[str, Any]:
    try:
        with open(file_path, "r") as f:
            return toml.load(f)
    except FileNotFoundError:
        print(f"Error: The file {file_path} was not found.")
        return {}
    except toml.TomlDecodeError:
        print(f"Error: Failed to decode the file {file_path}.")
        return {}


def find_model_by_name(models: List[Dict[str, Any]], name: str) -> Optional[Model]:
    for model_data in models:
        if model_data.get("name") == name:
            return Model(
                name=model_data.get("name"),
                llm_service=model_data.get("llm_service"),
                deployment_name=model_data.get("deployment_name"),
                api_key=model_data.get("api_key"),
                api_version=model_data.get("api_version"),
                azure_endpoint=model_data.get("azure_endpoint"),
            )
    return None


def chat_completion(
    request_data: RequestData,
) -> Tuple[Union[ResponseData, ResponseErrorData], int]:
    try:
        logger = current_app.logger
        logger.debug("- chat_completion called -")
        logger.debug(request_data)
        logger.debug(type(request_data))

        load_dotenv()

        # llm_api = os.environ.get("PRE_LLM_API")
        def_file = os.environ.get("PRE_DEF_MODEL")
        if def_file is None:
            raise Exception("PRE_DEF_MODEL not defined")
        table = load_toml(def_file)
        model_name = LLM_MODEL  # temporal
        if "model" in table:
            models: List[Dict[str, Any]] = table["model"]
            model = find_model_by_name(models, model_name)
            if model:
                logger.debug(f"model: {model}")
            else:
                raise Exception("model_name {model_name} not found")
        else:
            raise Exception("model not found in table")

        logger.debug(f"model_name: {model_name}")
        logger.debug(f"llm_service: {model.llm_service}")
        logger.debug(f"api_key env: {model.api_key}")
        if model.api_key is None:
            raise Exception("api_key envname not defined")
        logger.debug(f"deployment_name: {model.deployment_name}")
        deployment_name = model.deployment_name
        if deployment_name is None:
            raise Exception("deployment name not defined")

        api_key = os.environ.get(model.api_key)
        if api_key is None:
            raise Exception("api_key not defined")

        client: Union[AzureOpenAI, OpenAI]
        if model.llm_service == "Azure":
            if model.azure_endpoint is None:
                raise Exception("azure_endpoint is None")
            client = AzureOpenAI(
                api_key=api_key,
                api_version=model.api_version,
                azure_endpoint=model.azure_endpoint,
            )
        elif model.llm_service == "OpenAI":
            client = OpenAI(api_key=api_key)
        else:
            raise Exception("invalid llm_service")

        current_datetime = get_current_datetime()
        qa_id = current_datetime + "_" + request_data.user_id
        logger.debug(f"qa_id: {qa_id}")

        lines = len(request_data.user_content.split("\n"))
        logger.debug(f"Number of lines: {lines}")

        logger.debug(request_data.user_content)

        messages: list[ChatCompletionMessageParam] = [
            ChatCompletionSystemMessageParam(
                role="system", content=f"{request_data.system_content}"
            ),
            ChatCompletionUserMessageParam(
                role="user", content=f"{request_data.user_content}"
            ),
        ]

        runmode = os.environ.get("PRE_RUNMODE")
        response: Union[MagicMock, ChatCompletion]
        if runmode == "Mock":
            logger.debug("--OpenAI API Mocking--")
            loadfile = os.environ.get("PRE_MOCKDATA_FILE")
            if loadfile is None:
                raise Exception("PRE_MOCKDATA_FILE not defined")
            response = get_response(loadfile)
        else:
            logger.debug("--OpenAI API Call--")
            response = client.chat.completions.create(
                model=deployment_name,
                messages=messages,
                temperature=request_data.temperature,
            )
            logger.debug(type(response))
            response_json = response.model_dump_json(indent=2)
            logger.debug(response_json)

        if response.usage is not None:
            completion_tokens = response.usage.completion_tokens
            prompt_tokens = response.usage.prompt_tokens
        else:
            completion_tokens = 0
            prompt_tokens = 0

        response_data: ResponseData = ResponseData(
            finish_reason=response.choices[0].finish_reason,
            content=response.choices[0].message.content,
            completion_tokens=completion_tokens,
            prompt_tokens=prompt_tokens,
            qa_id=qa_id,
            lines=lines,
            prompt_class=request_data.prompt_class,
            temperature=request_data.temperature,
        )

        # qa_log
        request_data_dict = asdict(request_data)
        logger.debug(request_data_dict)
        qa_log_dir = os.environ.get("PRE_QA_LOG_DIR")
        if qa_log_dir is None:
            raise Exception("PRE_QA_LOG_DIR is not set.")
        logger.debug(qa_log_dir)
        logfile = qa_log_dir + qa_id + QA_LOGFILE_EXTENSION
        chat_completion_request = {
            "model": deployment_name,
            "messages": messages,
            "temperature": request_data.temperature,
            "prompt_class": request_data.prompt_class,
        }
        request_qa_log = {"qa_request": chat_completion_request}
        chat_completion_response = {
            "finish_reason": response.choices[0].finish_reason,
            "content": response.choices[0].message.content,
            "completion_tokens": completion_tokens,
            "prompt_tokens": prompt_tokens,
        }
        response_qa_log = {"qa_response": chat_completion_response}
        with open(logfile, "w") as f:
            toml.dump(request_qa_log, f)
            toml.dump(response_qa_log, f)

        logger.debug(response_data)
        logger.debug("- chat_completion return -")
        return response_data, 200

    except Exception as e:
        t = traceback.format_exception_only(type(e), e)
        error_response = ResponseErrorData(error=e.__class__.__name__, detail=t[0])
        logger.debug(f"error_response: {error_response}")
        return error_response, 500
