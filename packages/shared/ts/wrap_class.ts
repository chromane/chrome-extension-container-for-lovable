import config from "@shared/config";

function write_method_call({ obj, class_name, method_name, args, output, error, stub, stack, ignore }) {
  // if (!ignore) {
  // if (!ignore && config.mode !== "prod") {
  if (true) {
    let log_color = "eggshell";
    if (stub) {
      log_color = "yellow";
    } else if (error) {
      log_color = "red";
    } else if (class_name.endsWith("Fake")) {
      log_color = "orange";
    } else {
      log_color = "white";
    }

    let name = class_name + "." + method_name;

    let mute_arr: Array<string> = [];
    if (mute_arr.includes(name)) {
      return;
    }

    console.groupCollapsed("%c " + class_name + "." + method_name, `color: ${log_color}`);
    // console.group("%c " + class_name + "." + method_name, `color: ${log_color}`);
    console.log("this:");
    console.log(obj);
    console.log("input:");
    for (var i = 0; i < args.length; i++) {
      console.log(args[i]);
    }
    console.log(args);
    console.log("output:");
    console.log(output);

    if (error) {
      console.log(stack);
    }

    console.groupEnd();
  }
}

function get_methods(obj: object) {
  return Object.getOwnPropertyNames(obj).filter((item) => {
    try {
      return typeof obj[item] === "function";
    } catch (e) {
      return false;
    }
  });
}

export default function wrap_class(item: any, ignore: string[] = []) {
  let class_name = item.name;
  let methods = get_methods(item.prototype);
  console.log("methods", item, methods);
  methods.forEach((method_name) => {
    console.log("method_name", method_name);
    let original = item.prototype[method_name];
    item.prototype[method_name] = function () {
      let log: any = {
        ignore: ignore.includes(method_name),
        obj: this,
        class_name,
        method_name,
        args: Array.from(arguments),
        stub: false,
      };
      const stubs: any = [];
      if (stubs && stubs[0] && stubs[0].class_name === class_name && stubs[0].method_name === method_name) {
        log.stub = true;
        log.output = stubs[0].output;
        stubs.splice(0, 1);
        write_method_call(log);
        return log.output;
      } else {
        try {
          log.output = original.apply(this, arguments);
        } catch (e) {
          log.error = true;
          // @ts-ignore
          log.stack = e.stack;
          log.output = null;
        }
        if (log.output && log.output.then) {
          log.output = new Promise((resolve) => {
            log.output
              .then((result) => {
                log.output = result;
                write_method_call(log);
                resolve(result);
              })
              .catch((e) => {
                log.error = true;
                log.stack = e.stack;
                log.output = null;
                write_method_call(log);
                resolve(null);
              });
          });
        } else {
          write_method_call(log);
        }
        return log.output;
      }
    };
  });
}
