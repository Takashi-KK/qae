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

app.post("/chat_completion", (req, res) => {
  logger.info("--- POST(/chat_completion) request received ---");
  logger.debug("req : %s", req.body);
  const rawdata = fs.readFileSync("chat_completion.json");
  const data = JSON.parse(rawdata);
  logger.debug("res : %s", data);
  logger.info("--- POST response ---");
  res.status(200).json(data);
});
app.post("/add_evaluation", (req, res) => {
  logger.info("--- POST(/add_evaluation) request received ---");
  logger.debug("req : %s", req.body);
  const rawdata = fs.readFileSync("add_evaluation.json");
  const data = JSON.parse(rawdata);
  logger.debug("res : %s", data);
  logger.info("--- POST response ---");
  res.status(200).json(data);
});
app.get("/get_modellist", (req, res) => {
  logger.info("--- POST(/get_modellist) request received ---");
  const rawdata = fs.readFileSync("get_modellist.json");
  const data = JSON.parse(rawdata);
  logger.debug("data.models.length : %d", data.models.length);
  for (let i=0; i<data.models.length; i++) {
    logger.debug("model[%d] : \n%s", i, data.models[i]);
  }
  
  logger.info("--- POST response ---");
  res.status(200).json(data);
});

app.listen(3001, () => {
  logger.info("Server running on port 3001");
});
