import config from "../config";

class Logger {
  log(...args) {
    if (config.mode !== "prod") {
      console.log.call(console, ...args);
    }
  }
}

export default new Logger();
