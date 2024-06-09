import logging
import logging.handlers

LOG_DIR = "./log/"
LOGFILE_EXTENSION = ".log"
LOGFILE_MAXBYTES = 800000
LOGFILE_BACKUPCOUNT = 8


def pre_logger(module_name: str) -> logging.Logger:
  logger = logging.getLogger(module_name)
  logger.handlers.clear()

  stream_handler = logging.StreamHandler()
  logfile = LOG_DIR + module_name + LOGFILE_EXTENSION
  file_handler = logging.handlers.RotatingFileHandler(
    logfile, maxBytes=LOGFILE_MAXBYTES, backupCount=LOGFILE_BACKUPCOUNT
  )
  formatter = logging.Formatter(
    "%(asctime)s.%(msecs)03d %(levelname)-8s %(name)-8s %(message)s",
    datefmt="%Y%m%d %H:%M:%S",
  )
  stream_handler.setFormatter(formatter)
  file_handler.setFormatter(formatter)

  logger.setLevel(logging.DEBUG)
  stream_handler.setLevel(logging.INFO)
  file_handler.setLevel(logging.DEBUG)

  logger.addHandler(stream_handler)
  logger.addHandler(file_handler)

  return logger
