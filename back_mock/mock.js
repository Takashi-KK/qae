const express = require("express");
const fs = require("fs");
const log4js = require("log4js");
const path = require("path");
const cors = require("cors");
const app = express();

app.use(cors());

let logfile = path.parse(__filename).name + ".log";
log4js.configure({
  appenders: {
    file: {
      type: "file",
      filename: logfile,
      layout: {
        type: "pattern",
        pattern: "%d{yyyyMMdd hh:mm:ss.SSS} %-5p %m",
      },
    },
    console: {
      type: "console",
      layout: {
        type: "pattern",
        pattern: "%[%d{yyyyMMdd hh:mm:ss.SSS} %-5p%] %m",
      },
    },
    wrapper: { type: "logLevelFilter", appender: "console", level: "info" },
  },
  categories: {
    default: { appenders: ["file", "wrapper"], level: "debug" },
  },
});

const logger = log4js.getLogger();

app.use(express.json());

app.get("/api", (req, res) => {
  res.json(data);
});

app.post("/chat", (req, res) => {
  logger.info("--- POST(/chat) request received ---");
  logger.info("req : %s", req.body);
  const rawdata = fs.readFileSync("chat.json");
  const data = JSON.parse(rawdata);
  logger.info("res : %s", data);
  logger.info("--- POST response ---");
  res.status(200).json(data);
});
app.post("/add", (req, res) => {
  logger.info("--- POST(/add) request received ---");
  logger.info("req : %s", req.body);
  const rawdata = fs.readFileSync("add.json");
  const data = JSON.parse(rawdata);
  logger.info("res : %s", data);
  logger.info("--- POST response ---");
  res.status(200).json(data);
});

app.listen(3001, () => {
  logger.info("Server running on port 3001");
});
