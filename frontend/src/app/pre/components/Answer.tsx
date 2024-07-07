import {
  Box,
  Typography,
  Grid,
  Button,
  Slider,
  TextField,
} from "@mui/material";
import React, { ChangeEvent, useState } from "react";
import Editor from "@monaco-editor/react";
import { sendPostRequest } from "../util/api";

const SUCCESS_MESSAGE = "Added Successfully";
const MESSAGE_TIMEOUT = 5000;
const ANSWER_ENDPOINT = "/add_evaluation";

const marks = [
  {
    value: 0.0,
    label: "0.0",
  },
  {
    value: 1.0,
    label: "1.0",
  },
  {
    value: 2.0,
    label: "2.0",
  },
  {
    value: 3.0,
    label: "3.0",
  },
];
interface RequestData {
  qa_id: string;
  lines: number;
  prompt_class: string;
  temperature: number;
  completion_tokens: number;
  prompt_tokens: number;
  rating: number;
  comment: string;
}
interface ResponseData {
  result: string;
}
interface ResponseErrorData {
  error: string;
  detail: string;
}

interface AnswerProps {
  qaId: string;
  lines: number;
  finishReason: string;
  promptTokens: number;
  completionTokens: number;
  content: string;
  promptClass: string;
  temperature: number;
  setQaId: (qaId: string) => void;
  setUserContent: (newValue: string) => void;
  setPromptClass: (promptClass: string) => void;
  setContent: (content: string) => void;
  setPromptTokens: (lines: number) => void;
  setLines: (lines: number) => void;
  setCompletionTokens: (completionTokens: number) => void;
  setFinishReason: (finishReason: string) => void;
}

const Answer: React.FC<AnswerProps> = ({
  qaId,
  lines,
  finishReason,
  promptTokens,
  completionTokens,
  content,
  promptClass,
  temperature,
  setQaId,
  setUserContent,
  setPromptClass,
  setContent,
  setPromptTokens,
  setLines,
  setCompletionTokens,
  setFinishReason,
}) => {
  const [rating, setRating] = useState<number>(0.0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [resultMessage, setResultMessage] = useState<string>("\u00a0");
  const valueRank = (value: number, index: number): string => {
    return value.toString();
  };
  const handleRatingChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      console.log(newValue);
      setRating(newValue);
    }
  };
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editor.updateOptions({ wordWrap: "on" });
  };
  const handleComment = (e: ChangeEvent<HTMLInputElement>) => {
    console.log("handleComment called");
    const inputValue: string = e.target.value;
    console.log(inputValue);
    setComment(inputValue);
  };
  const handleAddEvaluation = async () => {
    console.log("handleAddEvaluation called");
    setLoading(true);
    setError("");
    const requestData: RequestData = {
      qa_id: qaId,
      lines: lines,
      prompt_class: promptClass,
      temperature: temperature,
      completion_tokens: completionTokens,
      prompt_tokens: promptTokens,
      rating: rating,
      comment: comment,
    };
    const url = process.env.NEXT_PUBLIC_API_SERVER_URL + ANSWER_ENDPOINT;
    try {
      const response = await sendPostRequest<
        RequestData,
        ResponseData | ResponseErrorData
      >(url, requestData);
      console.log(response.data);
      if ("result" in response.data) {
        //success
        setError("");
        setLoading(false);
        setSuccess(true);
        setQaId("");
        setUserContent("");
        setPromptClass("");
        setContent("");
        setPromptTokens(0);
        setLines(0);
        setCompletionTokens(0);
        setFinishReason("");
        setResultMessage(SUCCESS_MESSAGE);
        setTimeout(() => {
          setResultMessage("\u00a0");
        }, MESSAGE_TIMEOUT);
        setComment("");
      } else {
        //error
        const errorData = response.data as ResponseErrorData;
        setError(errorData.detail);
        setLoading(false);
        setSuccess(false);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error && error.message) {
        setError(error.message);
        setLoading(false);
        setSuccess(false);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={{ paddingTop: 1 }}>
      <Typography variant="h5">Answer</Typography>
      <Grid container>
        <Grid
          item
          container
          xs={12}
          style={{ height: "40vh", paddingLeft: "20px", paddingRight: "20px" }}
        >
          <Grid item xs={3}>
            <Typography variant="subtitle1">QA-ID</Typography>
          </Grid>
          <Grid item xs={9}>
            <Typography variant="subtitle1">{qaId}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle1">Prompt Tokens</Typography>
          </Grid>
          <Grid item xs={2} textAlign="right" sx={{ paddingRight: 2 }}>
            <Typography variant="subtitle1">{promptTokens}</Typography>
          </Grid>
          <Grid item xs={3} sx={{ paddingLeft: 1 }}>
            <Typography variant="subtitle1">Prompt Lines</Typography>
          </Grid>
          <Grid item xs={3} textAlign="right" sx={{ paddingRight: 2 }}>
            <Typography variant="subtitle1">{lines}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle1">Completion Tokens</Typography>
          </Grid>
          <Grid item xs={2} textAlign="right" sx={{ paddingRight: 2 }}>
            <Typography variant="subtitle1">{completionTokens}</Typography>
          </Grid>
          <Grid item xs={3} sx={{ paddingLeft: 1 }}>
            <Typography variant="subtitle1">Finish Reason</Typography>
          </Grid>
          <Grid item xs={3} textAlign="right" sx={{ paddingRight: 2 }}>
            <Typography variant="subtitle1">{finishReason}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="subtitle1">Rating</Typography>
          </Grid>
          <Grid item xs={9}>
            <Slider
              aria-label="Rating"
              size="small"
              value={rating}
              onChange={handleRatingChange}
              valueLabelDisplay="auto"
              getAriaValueText={valueRank}
              step={0.5}
              min={0.0}
              max={3.0}
              marks={marks}
            />
          </Grid>
          <Grid item xs={3}>
            <Typography variant="subtitle1">Comments</Typography>
          </Grid>
          <Grid item xs={9}>
            <TextField
              size="small"
              fullWidth
              multiline
              maxRows={2}
              onChange={handleComment}
              value={comment}
            />
          </Grid>
        </Grid>
        <Grid item xs={12} textAlign="center">
          <Button
            variant="contained"
            onClick={handleAddEvaluation}
            disabled={
              qaId === "" || qaId === null || comment === "" || comment === null
            }
          >
            Add Evaluation
          </Button>
        </Grid>
        <Grid item xs={12} textAlign="center">
          {loading && <Typography>Loading...</Typography>}
          {!loading && error && (
            <Typography color="error.main">{error}</Typography>
          )}
          {!loading && !error && (
            <Typography color="success.main">{resultMessage}</Typography>
          )}
        </Grid>
        <Typography variant="subtitle1">Result</Typography>
        <Editor
          height="90vh"
          value={content}
          options={{ minimap: { enabled: false } }}
          onMount={handleEditorDidMount}
        />
      </Grid>
    </Box>
  );
};

export default Answer;
