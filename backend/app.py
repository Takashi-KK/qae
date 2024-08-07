import json
import os
import traceback

from dotenv import load_dotenv
from flask import Flask, Response, jsonify, make_response, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

import pre_add_evaluation
import pre_chat_completion
import pre_get_modellist
import pre_logger
from pre_response_errordata import ResponseErrorData

app = Flask(__name__)
CORS(app)

load_dotenv()

log_dir = os.environ.get("PRE_LOG_DIR")
if log_dir is None:
    raise Exception("PRE_LOG_DIR not defined")
app.logger = pre_logger.pre_logger(module_name=__name__, log_dir=log_dir)


@app.errorhandler(Exception)
def handle_exception(e: Exception) -> Response:
    if not isinstance(e, HTTPException):
        status_code = 500
    else:
        if e.code is not None:
            status_code = e.code
        else:
            status_code = 500

    t = traceback.format_exception_only(type(e), e)
    error_response = ResponseErrorData(error=e.__class__.__name__, detail=t[0])
    app.logger.error(error_response)
    response = make_response(jsonify(error_response), status_code)
    return response


@app.route("/", methods=["GET"])
def get_hello() -> str:
    return "<p>Hello World!</p>"


@app.route("/get_modellist", methods=["GET"])
def get_get_modellist() -> Response:
    app.logger.info("--- GET /get_modellist received ---")
    response_data, status_code = pre_get_modellist.get_modellist()
    response = make_response(jsonify(response_data), status_code)
    app.logger.debug("jsonify(response_data)")
    app.logger.debug(jsonify(response_data))
    app.logger.info("--- GET /get_modellist return ---")
    return response


@app.route("/chat_completion", methods=["POST"])
def post_chat_completion() -> Response:
    app.logger.info("--- POST /chat_completion received ---")
    app.logger.debug(request)
    request_data_dict = json.loads(request.data)
    request_data = pre_chat_completion.RequestData(
        system_content=request_data_dict["system_content"],
        user_content=request_data_dict["user_content"],
        temperature=request_data_dict["temperature"],
        prompt_class=request_data_dict["prompt_class"],
        user_id=request_data_dict["user_id"],
        selected_model=request_data_dict["selected_model"],
    )

    response_data, status_code = pre_chat_completion.chat_completion(request_data)
    response = make_response(jsonify(response_data), status_code)
    app.logger.info("--- POST /chat_evaluation return ---")
    return response


@app.route("/add_evaluation", methods=["POST"])
def post_add_evaluation() -> Response:
    app.logger.info("--- POST /add_evaluation received ---")
    request_data_dict = json.loads(request.data)
    request_data = pre_add_evaluation.RequestData(
        qa_id=request_data_dict["qa_id"],
        lines=request_data_dict["lines"],
        prompt_class=request_data_dict["prompt_class"],
        temperature=request_data_dict["temperature"],
        completion_tokens=request_data_dict["completion_tokens"],
        prompt_tokens=request_data_dict["prompt_tokens"],
        rating=request_data_dict["rating"],
        comment=request_data_dict["comment"],
    )

    response_data, status_code = pre_add_evaluation.add_evaluation(request_data)
    response = make_response(jsonify(response_data), status_code)
    app.logger.info("--- POST /add_evaluation return ---")
    return response
