import internal from "./internal";
import ControllerServer from "./ControllerServer";
import { BackendResponseBase, RESPONSE_CODE, UserDoc } from "@shared/types/common";
import { user_service } from "./services/UserService";
import config from "@shared/config";
import { MongoClient, ObjectId } from "mongodb";
import { decode_jwt, get_id } from "@shared/ts/helpers";
import console_log from "@shared/ts/console_log";
import { createClient } from "@supabase/supabase-js";

export default class ModuleTest {
  backend: ControllerServer;
  constructor(backend: ControllerServer) {
    this.backend = backend;
  }

  async get_jwt_by_email(
    email: string
    //
  ): Promise<BackendResponseBase<string>> {
    const user_doc = await user_service.get_user_doc_by_email(email);

    if (!user_doc) return { code: RESPONSE_CODE.ERROR_NOT_FOUND };
    const claims = this.backend.auth.internal.doc_to_claims(user_doc);
    const jwt_token = this.backend.auth.internal.create_jwt(claims);

    return {
      code: RESPONSE_CODE.SUCCESS,
      data: jwt_token,
    };
  }

  async test_log() {
    if (config.mode === "dev") {
      let result = await internal.mongo.collection("logs").insertOne({
        _id: new ObjectId(),
        ts: Date.now(),
        name: "test555",
        tags: [],
        json: "{}",
      });
      console.log("result", result);
    }
  }
  async restore_db() {
    if (config.mode === "dev") {
      // for (let item of data.videos) {
      //   if (item && item.tags) {
      //     let tags_new: any = [];
      //     for (let tag_id in item.tags) {
      //       tags_new.push(item.tags[tag_id].name);
      //     }
      //     delete item.tag_ids;
      //     item._id = item.id;
      //     item.tags = tags_new;
      //   }
      // }
      // for (let user of data.users) {
      //   user.id = user.uid;
      //   user._id = user.uid;
      // }
      // await internal.mongo.collection("videos").insertMany(data.videos);
      // await internal.mongo.collection("users").insertMany(data.users);
    }
  }
  async get_user_videos() {
    if (config.mode === "dev") {
      let all = await internal.mongo.collection("videos").find({
        user_id: "R72kUs4pdSoZ4Q1KBS4S",
      });
      let arr = await all.toArray();
      return { arr };
    }
    return {};
  }
  async get_all_videos() {
    if (config.mode === "dev") {
      let all = await internal.mongo.collection("videos").find({});
      console.log("all", all);
      let arr = await all.toArray();
      return { arr };
    }
    return {};
  }
  async update_log() {
    if (config.mode === "dev") {
      let result = await internal.mongo.collection("logs").updateOne(
        //
        { _id: new ObjectId("67d7024fca8635929895ff8d") },
        { $set: { name: "test12377776677" } },
        { upsert: true }
      );
      console.log("result", result);
      return { result };
    }
    return {};
  }
  async create_code() {
    if (config.mode === "dev") {
      let result = await internal.mongo.collection("codes").insertOne({
        _id: new ObjectId(),
        email: "vlas@chromane.com",
        code: "CODE123",
      });
      return result;
    }
    return {};
  }
  async find_code() {
    if (config.mode === "dev") {
      let result = await internal.mongo.collection("codes").findOne({
        email: "vlas@chromane.com",
        code: "CODE123",
      });
      return result;
    }
    return {};
  }
  async fix_video_id() {
    if (config.mode === "dev") {
      let all = await internal.mongo.collection("videos").find({});
      // console.log("all", all);
      let arr: any = await all.toArray();
      //
      for (let video of arr) {
        console.log(video._id, typeof video.video_id);
        if (typeof video.video_id === "number") {
          await internal.mongo.collection("videos").findOneAndUpdate(
            { _id: video._id },
            {
              $set: {
                video_id: video.video_id.toString(),
              },
            }
          );
          console.log("done");
        }
      }
      //
      return { arr };
    }
    return {};
  }
  async give_test_user_videos() {
    if (config.mode === "dev") {
      let all = await internal.mongo.collection("videos").find({});
      console.log("all", all);
      let arr = await all.toArray();
      //
      for (let item of arr) {
        item._id = new ObjectId();
        item.id = item._id.toString();
        item.user_id = "67e1a666d3cb6f82853d6c9d";
      }
      // await internal.mongo.collection("videos").insertMany(arr);
      //
      return { arr };
    }
    return {};
  }
  // test
  async test() {}
  async make_all_docs_not_broken() {
    if (config.mode === "dev") {
      // let r = await internal.mongo.collection("users").findOne({ _id: "67e2722b22afe7bfc39b901f" });
      let result = await internal.mongo.collection("videos").find({});
      let arr = await result.toArray();
      //
      for (let item of arr) {
        console_log(item.url);
        await internal.mongo.collection("videos").findOneAndUpdate(
          {
            _id: item._id,
          },
          {
            $set: {
              is_link_broken: false,
            },
          }
        );
        console_log("done");
      }
      //
      return { arr };
    }
    return {};
  }
  async test1() {
    // if (config.mode === "dev") {
    // let r = await internal.mongo.collection("users").findOne({ _id: "67e2722b22afe7bfc39b901f" });
    let result = await internal.mongo.collection("videos").find({ user_id: new ObjectId("67e2722b22afe7bfc39c3bf3") });
    let arr = await result.toArray();
    return { arr };
    // }
    return {};
  }
  async test2() {
    // if (config.mode === "dev") {
    // let r = await internal.mongo.collection("users").findOne({ _id: "67e2722b22afe7bfc39b901f" });
    let result = await internal.mongo.collection("videos").find({ user_id: "no_user_like_this" });
    let arr = await result.toArray();
    return { arr };
    // }
    return {};
  }
  async restart_server() {
    // todo: add admin check here
    // let command_name = command.split(" ")[0];
    // let command_args = command.split(" ").slice(1);
    // return spawn(command_name, command_args, {
    //   cwd,
    //   stdio: "inherit",
    //   shell: true,
    // });
  }
  async get_supabase_users() {
    // Create a single supabase client for interacting with your database
    const supabase = createClient(internal.secrets.supabase_project_url, internal.secrets.supabase_token_secret);
    const { data, error } = await supabase
      //
      .from("clients")
      .select("*");
    // .order("country", { ascending: true })
    // .order("state", { ascending: true });
    return {
      supabase_token_public: decode_jwt(internal.secrets.supabase_token_public),
      supabase_token_secret: decode_jwt(internal.secrets.supabase_token_secret),
      data,
      error,
    };
  }
}
