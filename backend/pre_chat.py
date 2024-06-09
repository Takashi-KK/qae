import os
import traceback
from dataclasses import asdict, dataclass
from datetime import datetime
from typing import Tuple, Union

import toml
from dotenv import load_dotenv
from flask import current_app
from openai import OpenAI
from openai.types.chat import (
    ChatCompletionMessageParam,
    ChatCompletionSystemMessageParam,
    ChatCompletionUserMessageParam,
)

LLM_MODEL = "gpt-3.5-turbo"
# QA_LOG_DIR = "./qa_log/"
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


def get_current_datetime() -> str:
    now = datetime.now()
    formatted_datetime = now.strftime("%Y%m%d_%H%M%S")
    return formatted_datetime


def chat_completion(
    request_data: RequestData,
) -> Tuple[Union[ResponseData, ResponseErrorData], int]:
    try:
        logger = current_app.logger
        logger.debug("- chat_completion called -")
        logger.debug(request_data)
        logger.debug(type(request_data))

        load_dotenv()
        api_key = os.environ.get("OPENAI_API_KEY")
        client = OpenAI(api_key=api_key)

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

        response = client.chat.completions.create(
            model=LLM_MODEL, messages=messages, temperature=request_data.temperature
        )
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
        logger.debug(qa_log_dir)
        logfile = qa_log_dir + qa_id + QA_LOGFILE_EXTENSION
        chat_completion_request = {
            "model": LLM_MODEL,
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

        """
    response_data: ResponseData = ResponseData(
      finish_reason="stop",
      content="zzzzz",
      completion_tokens=225,
      prompt_tokens=307,
      qa_id="20240430_111001",
      lines=125,
      prompt_class="Class-Name",
      temperature=0.8,
    )
    """

        logger.debug(response_data)
        logger.debug("- chat_completion return -")
        return response_data, 200

    except Exception as e:
        t = traceback.format_exception_only(type(e), e)
        error_response = ResponseErrorData(error=e.__class__.__name__, detail=t[0])
        logger.debug(f"error_response: {error_response}")
        return error_response, 500
