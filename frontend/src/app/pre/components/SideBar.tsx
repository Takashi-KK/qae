import { Drawer, Box, Typography } from "@mui/material";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
  setUserContent: React.Dispatch<React.SetStateAction<string | null>>;
}

const SideBar: React.FC<SideBarProps> = ({
  isOpen,
  onClose,
  setUserContent,
}) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (accFiles: File[]) => {
      const lastFile = accFiles[accFiles.length - 1];
      console.log(lastFile);
      if (lastFile.type === "text/plain") {
        const maxFilesizeStr = process.env.NEXT_PUBLIC_MAX_PROMPT_FILESIZE;
        console.log(maxFilesizeStr);
        if (maxFilesizeStr === undefined) {
          setUserContent("Error: max file size undefined.");
          return;
        }
        const maxFilesize = parseInt(maxFilesizeStr, 10);
        if (isNaN(maxFilesize)) {
          setUserContent("Error: invalid max file size configuration.");
          return;
        }
        console.log(maxFilesize);
        if (lastFile.size > maxFilesize) {
          setUserContent("Error: invalid file size");
        } else {
          setFiles((curr) => [...curr, lastFile]);
          const reader = new FileReader();
          reader.onload = () => {
            const newContents = reader.result as string;
            setUserContent(newContents);
          };
          reader.readAsText(lastFile);
        }
      } else {
        setUserContent("Error: invalid file type");
      }
    },
    [setUserContent]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <Drawer anchor="left" open={isOpen} onClose={onClose}>
      <Box p={2} width="250px" textAlign="center" role="presentation">
        <Typography variant="h6" component="div">
          Side Panel
        </Typography>
      </Box>
      <Box
        {...getRootProps()}
        sx={{
          border: "1px dashed grey",
          display: "flex",
          flexFlow: "column nowrap",
          alignItems: "center",
        }}
      >
        <input {...getInputProps()} />
        <Typography sx={{ p: 1 }}>Click or Drop file</Typography>
      </Box>
    </Drawer>
  );
};

export default SideBar;
