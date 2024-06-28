import {
  Box,
  Typography,
  TextField,
  Grid,
  Slider,
  Button,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import React, { useState, ChangeEvent } from "react";
import Editor from "@monaco-editor/react";
import { sendPostRequest, sendGetRequest } from "../util/api";

const COMPLETION_ENDPOINT = "/chat_completion";
const MODELLIST_ENDPOINT = "/get_modellist";

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

// API Server Interface
interface ChatCompletionRequestData {
  system_content: string | undefined;
  user_content: string | null;
  temperature: number;
  prompt_class: string | null;
  user_id: string;
  selected_model: string;
}
interface ChatCompletionResponseData {
  qa_id: string;
  finish_reason: string;
  content: string;
  completion_tokens: number;
  prompt_tokens: number;
  lines: number;
  prompt_class: string;
  temperature: number;
}
interface ModelData {
  name: string;
  llm_service: string;
  deployment_name: string;
  api_key: string;
  api_version: string | null;
  azure_endpoint: string | null;
}
interface ModelListResponseData {
  models: ModelData[];
}
interface ResponseErrorData {
  error: string;
  detail: string;
}

// Component Interface
interface QuestionProps {
  userContent: string | null;
  temperature: number;
  promptClass: string | null;
  userId: string;
  selectedModel: string;
  setUserContent: (newValue: string) => void;
  setTemperature: (newValue: number) => void;
  setPromptClass: (promptClass: string) => void;
  setQaId: (qaId: string) => void;
  setLines: (lines: number) => void;
  setFinishReason: (finishReason: string) => void;
  setPromptTokens: (lines: number) => void;
  setCompletionTokens: (completionTokens: number) => void;
  setContent: (content: string) => void;
  setSelectedModel: (newValue: string) => void;
}

// Question Component
const Question: React.FC<QuestionProps> = ({
  userContent,
  temperature,
  promptClass,
  userId,
  selectedModel,
  setUserContent,
  setTemperature,
  setPromptClass,
  setQaId,
  setLines,
  setFinishReason,
  setPromptTokens,
  setCompletionTokens,
  setContent,
  setSelectedModel,
}) => {
  const [askQuestionError, setAskQuestionError] = useState<string>("");
  const [askQuestionLoading, setAskQuestionLoading] = useState<boolean>(false);
  const [getModellistError, setGetModellistError] = useState<string>("");
  const [getModellistLoading, setGetModellistLoading] =
    useState<boolean>(false);
  const [models, setModels] = useState<ModelData[]>([]);
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
    setAskQuestionLoading(true);
    setAskQuestionError("");
    const requestData: ChatCompletionRequestData = {
      system_content: process.env.NEXT_PUBLIC_SYSTEM_CONTENT,
      user_content: userContent,
      temperature: temperature,
      prompt_class: promptClass,
      user_id: userId,
      selected_model: selectedModel,
    };
    const url = process.env.NEXT_PUBLIC_API_SERVER_URL + COMPLETION_ENDPOINT;
    console.log(`url: ${url}`);
    try {
      const response = await sendPostRequest<
        ChatCompletionRequestData,
        ChatCompletionResponseData | ResponseErrorData
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
        setAskQuestionError(errorData.detail);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error && error.message) {
        setAskQuestionError(error.message);
      }
    } finally {
      setAskQuestionLoading(false);
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
  const handleGetModelList = async () => {
    console.log("handleGetModelList called");
    setGetModellistLoading(true);
    setGetModellistError("");
    const url = process.env.NEXT_PUBLIC_API_SERVER_URL + MODELLIST_ENDPOINT;
    console.log(`url: ${url}`);
    try {
      const response = await sendGetRequest<
        ModelListResponseData | ResponseErrorData
      >(url);
      console.log(response.data);
      if ("models" in response.data) {
        setModels(response.data.models);
        setSelectedModel(response.data.models[0].name);
      } else {
        setGetModellistError("Invalid response data");
      }
    } catch (error) {
      console.log(error);
      if (error instanceof Error && error.message) {
        setGetModellistError(error.message);
      }
    } finally {
      setGetModellistLoading(false);
    }
  };
  const handleModelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedModel(event.target.value);
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
          <Grid item xs={3}>
            <Typography variant="subtitle1">Model</Typography>
          </Grid>
          <Grid item xs={6}>
            <Box width="200px">
              <TextField
                label="select model"
                variant="standard"
                select
                fullWidth
                value={selectedModel}
                onChange={handleModelChange}
              >
                {models.map((model) => (
                  <MenuItem key={model.name} value={model.name}>
                    {model.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Button onClick={handleGetModelList}>Get Modellist</Button>
          </Grid>
          <Grid item xs={12} textAlign="center">
            {getModellistLoading && <Typography>Loading...</Typography>}
            {getModellistError && (
              <Typography color="error">{getModellistError}</Typography>
            )}
            {!getModellistError && !getModellistLoading && (
              <Typography>&nbsp;</Typography>
            )}
          </Grid>
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
                selectedModel === null ||
                selectedModel === "" ||
                askQuestionLoading === true
              }
            >
              Ask Question
            </Button>
          </Grid>
          <Grid item xs={12} textAlign="center">
            {askQuestionLoading && <Typography>Loading...</Typography>}
            {askQuestionError && (
              <Typography color="error">{askQuestionError}</Typography>
            )}
            {!askQuestionError && !askQuestionLoading && (
              <Typography>&nbsp;</Typography>
            )}
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
