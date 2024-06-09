import {
  Box,
  Typography,
  TextField,
  Grid,
  Slider,
  Button,
} from "@mui/material";
import React, { useState, ChangeEvent } from "react";
import Editor from "@monaco-editor/react";
import { sendPostRequest } from "../util/api";

const QUESTION_ENDPOINT = "/chat";

const marks = [
  {
    value: 0.0,
    label: "0.0",
  },
  {
    value: 0.5,
    label: "0.5",
  },
  {
    value: 1.0,
    label: "1.0",
  },
];

interface RequestData {
  system_content: string | undefined;
  user_content: string | null;
  temperature: number;
  prompt_class: string | null;
  user_id: string;
}
interface ResponseData {
  qa_id: string;
  finish_reason: string;
  content: string;
  completion_tokens: number;
  prompt_tokens: number;
  lines: number;
  prompt_class: string;
  temperature: number;
}
interface ResponseErrorData {
  error: string;
  detail: string;
}

interface QuestionProps {
  userContent: string | null;
  temperature: number;
  promptClass: string | null;
  userId: string;
  setUserContent: (newValue: string) => void;
  setTemperature: (newValue: number) => void;
  setPromptClass: (promptClass: string) => void;
  setQaId: (qaId: string) => void;
  setLines: (lines: number) => void;
  setFinishReason: (finishReason: string) => void;
  setPromptTokens: (lines: number) => void;
  setCompletionTokens: (completionTokens: number) => void;
  setContent: (content: string) => void;
}

const Question: React.FC<QuestionProps> = ({
  userContent,
  temperature,
  promptClass,
  userId,
  setUserContent,
  setTemperature,
  setPromptClass,
  setQaId,
  setLines,
  setFinishReason,
  setPromptTokens,
  setCompletionTokens,
  setContent,
}) => {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const inputPromptClassHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue: string = e.target.value;
    console.log(inputValue);
    setPromptClass(inputValue);
  };
  const valueTemperature = (value: number, index: number): string => {
    return value.toString();
  };
  const handleTemperatureChange = (
    event: Event,
    newValue: number | number[]
  ) => {
    if (typeof newValue === "number") {
      console.log(newValue);
      setTemperature(newValue);
    }
  };
  const handleAskQuestion = async () => {
    console.log("handleAskQuestion called");
    setLoading(true);
    setError("");
    const requestData: RequestData = {
      system_content: process.env.NEXT_PUBLIC_SYSTEM_CONTENT,
      user_content: userContent,
      temperature: temperature,
      prompt_class: promptClass,
      user_id: userId,
    };
    const url = process.env.NEXT_PUBLIC_API_SERVER_URL + QUESTION_ENDPOINT;
    console.log(`url: ${url}`);
    try {
      const response = await sendPostRequest<
        RequestData,
        ResponseData | ResponseErrorData
      >(url, requestData);
      console.log(response.data);
      if ("qa_id" in response.data) {
        setQaId(response.data.qa_id);
        setLines(response.data.lines);
        setFinishReason(response.data.finish_reason);
        setPromptTokens(response.data.prompt_tokens);
        setCompletionTokens(response.data.completion_tokens);
        setContent(response.data.content);
      } else {
        const errorData = response.data as ResponseErrorData;
        setError(errorData.detail);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error && error.message) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editor.updateOptions({ wordWrap: "on" });
  };
  const handleEditorChange = (newValue: string | undefined) => {
    console.log("handleEditorChange called");
    setUserContent(newValue || "");
    console.log(userContent);
  };

  return (
    <Box sx={{ paddingTop: 1 }}>
      <Typography variant="h5">Question</Typography>
      <Grid container>
        <Grid
          item
          container
          xs={12}
          style={{ height: "40vh", paddingLeft: "20px", paddingRight: "20px" }}
        >
          <Grid item xs={4}>
            <Typography variant="subtitle1">Prompt Class</Typography>
          </Grid>
          <Grid item xs={8}>
            <TextField
              onChange={inputPromptClassHandler}
              variant="standard"
              value={promptClass}
              sx={{ p: 1 }}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography variant="subtitle1">Temperature</Typography>
          </Grid>
          <Grid item xs={8}>
            <Slider
              aria-label="Temperature"
              size="small"
              value={temperature}
              onChange={handleTemperatureChange}
              valueLabelDisplay="auto"
              getAriaValueText={valueTemperature}
              step={0.1}
              min={0.0}
              max={1.0}
              marks={marks}
            />
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid item xs={12} textAlign="center">
            <Button
              variant="contained"
              onClick={handleAskQuestion}
              disabled={
                userContent === null ||
                userContent === "" ||
                promptClass === null ||
                promptClass === "" ||
                loading === true
              }
            >
              Ask Question
            </Button>
          </Grid>
          <Grid item xs={12} textAlign="center">
            {loading && <Typography>Loading...</Typography>}
            {error && <Typography color="error">{error}</Typography>}
            {!error && !loading && <Typography>&nbsp;</Typography>}
          </Grid>
          <Typography variant="subtitle1">Prompt</Typography>
          <Editor
            height="90vh"
            value={userContent || ""}
            options={{ minimap: { enabled: false } }}
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Question;
