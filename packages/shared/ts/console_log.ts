import config from "../config";

let console_log = console.log;

if (config.mode === "prod") {
  console_log = () => {};
}

export default console_log;
