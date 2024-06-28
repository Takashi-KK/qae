"use client";
import { Box, Grid } from "@mui/material";
import React, { useState } from "react";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import Question from "./components/Question";
import Answer from "./components/Answer";

const PRE_DEFAULT_TEMPERATURE = 0.8;

const App = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // for request
  const [userContent, setUserContent] = useState<string | null>(null);
  const [temperature, setTemperature] = useState<number>(
    PRE_DEFAULT_TEMPERATURE
  );
  const [promptClass, setPromptClass] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState("");

  // for response
  const [qaId, setQaId] = useState<string>("");
  const [lines, setLines] = useState<number>(0);
  const [finishReason, setFinishReason] = useState<string>("");
  const [promptTokens, setPromptTokens] = useState<number>(0);
  const [completionTokens, setCompletionTokens] = useState<number>(0);
  const [content, setContent] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };
  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };
  return (
    <>
      <Box sx={{ px: 3 }}>
        <NavBar
          onDrawerOpen={handleDrawerOpen}
          userId={userId}
          setUserId={setUserId}
        />
        <SideBar
          isOpen={isDrawerOpen}
          onClose={handleDrawerClose}
          setUserContent={setUserContent}
        />
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Question
              userContent={userContent}
              temperature={temperature}
              promptClass={promptClass}
              userId={userId}
              selectedModel={selectedModel}
              setUserContent={setUserContent}
              setTemperature={setTemperature}
              setPromptClass={setPromptClass}
              setQaId={setQaId}
              setLines={setLines}
              setFinishReason={setFinishReason}
              setPromptTokens={setPromptTokens}
              setCompletionTokens={setCompletionTokens}
              setContent={setContent}
              setSelectedModel={setSelectedModel}
            />
          </Grid>
          <Grid item xs={6}>
            <Answer
              qaId={qaId}
              lines={lines}
              finishReason={finishReason}
              promptTokens={promptTokens}
              completionTokens={completionTokens}
              content={content}
              promptClass={promptClass}
              temperature={temperature}
              setQaId={setQaId}
              setUserContent={setUserContent}
              setPromptClass={setPromptClass}
              setContent={setContent}
              setPromptTokens={setPromptTokens}
              setLines={setLines}
              setCompletionTokens={setCompletionTokens}
              setFinishReason={setFinishReason}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default App;
