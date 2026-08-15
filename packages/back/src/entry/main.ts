import backend from "../ts/backend";
import internal from "../ts/internal";
import { url_to_params } from "@shared/ts/helpers";

// new:
import express, { Request, Response } from "express";
import config from "@shared/config";
function create_server() {
  const app = express();
  app.use(express.json({ limit: "100mb" }));
  const port = 8080;
  //
  app.options("/back/trpc", async (req: Request, res: Response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  });
  app.post("/back/trpc", async (req: Request, res: Response) => {
    //
    res.setHeader("Access-Control-Allow-Origin", "*");
    //
    let data_arr: any = req.body;
    //
    let module_name = data_arr[0];
    let method_name = data_arr[1];
    let method_args = data_arr.slice(2);
    // let backend = backend
    if (backend[module_name] && backend[module_name][method_name]) {
      console.log(`/back/trpc - ${module_name}.${method_name}`);
      try {
        let result = await backend[module_name][method_name].apply(backend[module_name], method_args);
        if (result && result.code) {
          console.log(`/back/trpc - ${module_name}.${method_name} - ${result.code}`);
        } else {
          console.log(`/back/trpc - ${module_name}.${method_name} - 602`);
        }
        res.status(200).send(JSON.stringify(result));
      } catch (error) {
        console.log(error);
        console.log(`/back/trpc - ${module_name}.${method_name} - 602`);
        res.status(602).send(JSON.stringify({ code: 602 }));
      }
    } else {
      res.status(404).send(JSON.stringify({ code: 404 }));
    }
    //
  });
  //
  app.get("/ping", (req: Request, res: Response) => {
    res.status(200).send("/ping - pong");
  });
  app.get("/back/ping", (req: Request, res: Response) => {
    res.status(200).send("/back/ping - pong");
  });
  // todo: test this
  app.get("/back/common-redirect", (req: Request, res: Response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let query_params = url_to_params(req.url);
    let new_location = `chrome-extension://${config.ext_id}/pages/redirect/index.html?state=${query_params.state}`;
    res.writeHead(302, {
      Location: new_location,
    });
    res.end();
  });
  // todo: test this and re-add to the Stripe dashboard
  app.get("/back/stripe-webhook", async (req: Request, res: Response) => {
    try {
      let result = await backend.stripe.webhook(req);
      res.status(200).send(JSON.stringify(result));
    } catch (error) {
      console.log(error);
      res.status(602).send(JSON.stringify({ code: 602 }));
    }
    res.send();
  });
  // todo: rework this and add authentication to this project
  app.get("/back/auth-redirect", (req: Request, res: Response) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let query_params = url_to_params(req.url);
    res.writeHead(302, {
      Location: `chrome-extension://${internal.config.extension_id}/pages/redirect/index.html?code=${query_params.code}&state=${query_params.state}&event_name=${query_params.event_name}`,
    });
    res.end();
  });
  // fallback
  app.options("*", function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Max-Age", "3600");
    res.status(204).send("");
  });
  app.get("*", function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    console.log(404, "GET", req.url);
    res.status(404).send(`not_found ${req.hostname}${req.url}`);
  });
  app.post("*", function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    console.log(404, "POST", req.url);
    res.status(404).send(`not_found ${req.hostname}${req.url}`);
  });
  app.listen(port, () => {
    console.log(`Express server is running at http://localhost:${port}`);
  });
  // static files will be hosted by nginx
  // from @root/packages/front/temp_front_build
  //
}
create_server();
