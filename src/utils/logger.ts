import winston, { Logger } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import fs from "fs";

function stringify(obj: object) {
  //check if obj in stringified already if so return
  if (typeof obj === "string" || obj instanceof String) return obj;

  let cache: object[] = [];
  const str = JSON.stringify(obj, function (_key, value: object) {
    if (typeof value === "object" && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
  cache = []; // reset the cache
  return str;
}

function transports(): winston.transport[] {
  const transports = [];
  if (process.env.NODE_ENV === "production") {
    transports.push(new winston.transports.Console({ level: "info" }));
    transports.push(
      new DailyRotateFile({
        filename: `logs/%DATE%-error.log`,
        level: "error",
        datePattern: "YYYY-MM-DD",
        zippedArchive: false,
        maxFiles: "30d",
      }),
    );
    transports.push(
      new DailyRotateFile({
        filename: `logs/%DATE%-combined.log`,
        datePattern: "YYYY-MM-DD",
        zippedArchive: false,
        maxFiles: "30d",
      }),
    );
  } else {
    transports.push(new winston.transports.Console({ level: "debug" }));
  }
  return transports;
}

function init(filename: string): Logger {
  //Check if directory "logs" exists, if not create it
  if (!fs.existsSync("logs")) {
    fs.mkdirSync("logs");
    console.info("Directory logs created");
  }

  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.timestamp({
        format: "YYYY-MM-DD hh:mm:ss.SSS A",
      }),
      winston.format.align(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        if (meta instanceof Error) {
          meta = { message: meta.message, stack: meta.stack };
        }
        if (Object.keys(meta).length === 0) {
          return `[${filename} ${timestamp}] ${level}: ${message}`;
        } else {
          return `[${filename} ${timestamp}] ${level}: ${message}\n${stringify(
            meta,
          )}`;
        }
      }),
    ),
    handleExceptions: false,
    exitOnError: false,
    transports: transports(),
  });
  return logger;
}

function getLogger(filename: string): winston.Logger {
  return init(filename);
}

export { init, getLogger };
