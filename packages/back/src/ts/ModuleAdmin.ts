import { get_id } from "@shared/ts/helpers";
import console_log from "@shared/ts/console_log";
import backend from "./backend";
import internal from "./internal";
import { RESPONSE_CODE } from "@shared/types/common";
import { ObjectId } from "mongodb";

export default class ModuleAdmin {
  //
  async supported_sites_get_all(jwt_token: string) {
    // Admin check
    let claims = await backend.auth.internal.jwt_verify_decode(jwt_token);
    if (claims.roles.includes("admin")) {
      // continue
    } else {
      return { code: RESPONSE_CODE.ERROR_UNAUTHORIZED };
    }
    //
    let supported_sites = await internal.db.collection("supported_sites").get();
    let docs = Array.from(supported_sites.docs).map((doc) => {
      let data: any = doc.data();
      data._id = doc.id;
      return data;
    });
    //
    return { code: RESPONSE_CODE.SUCCESS, supported_sites: docs };
    //
  }
  async supported_sites_create(jwt_token: string, body: any) {
    // Admin check
    let claims = await backend.auth.internal.jwt_verify_decode(jwt_token);
    if (claims.roles.includes("admin")) {
      // continue
    } else {
      return { code: RESPONSE_CODE.ERROR_UNAUTHORIZED };
    }
    //
    await internal.db.collection("supported_sites").add(body);
    return { code: RESPONSE_CODE.SUCCESS };
    //
  }
  async supported_sites_delete(jwt_token: string, _id: string) {
    // Admin check
    let claims = await backend.auth.internal.jwt_verify_decode(jwt_token);
    if (claims.roles.includes("admin")) {
      // continue
    } else {
      return { code: RESPONSE_CODE.ERROR_UNAUTHORIZED };
    }
    //
    await internal.db.collection("supported_sites").doc(_id).delete();
    return { code: RESPONSE_CODE.SUCCESS };
    //
  }
  async supported_sites_edit(jwt_token: string, body: any) {
    // Admin check
    let claims = await backend.auth.internal.jwt_verify_decode(jwt_token);
    if (claims.roles.includes("admin")) {
      // continue
    } else {
      return { code: RESPONSE_CODE.ERROR_UNAUTHORIZED };
    }
    //
    await internal.db.collection("supported_sites").doc(body._id).update(body);
    return { code: RESPONSE_CODE.SUCCESS };
    //
  }
  // Collections
  async collection_get_all(jwt_token: string, collection_name: string) {
    // Admin check
    let claims = await backend.auth.internal.jwt_verify_decode(jwt_token);
    if (claims.roles.includes("admin")) {
      // continue
    } else {
      return { code: RESPONSE_CODE.ERROR_UNAUTHORIZED };
    }
    //
    let result = await internal.mongo.collection(collection_name).find({});
    let docs = await result.toArray();
    //
    return { code: RESPONSE_CODE.SUCCESS, docs };
    //
  }
  async collection_create(jwt_token: string, collection_name: string, body: any) {
    // Admin check
    let claims = await backend.auth.internal.jwt_verify_decode(jwt_token);
    if (claims.roles.includes("admin")) {
      // continue
    } else {
      return { code: RESPONSE_CODE.ERROR_UNAUTHORIZED };
    }
    //
    await internal.db.collection("supported_sites").add(body);
    return { code: RESPONSE_CODE.SUCCESS };
    //
  }
  async collection_delete(jwt_token: string, collection_name: string, _id: string) {
    // Admin check
    let claims = await backend.auth.internal.jwt_verify_decode(jwt_token);
    if (claims.roles.includes("admin")) {
      // continue
    } else {
      return { code: RESPONSE_CODE.ERROR_UNAUTHORIZED };
    }
    //
    await internal.db.collection("supported_sites").doc(_id).delete();
    return { code: RESPONSE_CODE.SUCCESS };
    //
  }
  async collection_edit(jwt_token: string, collection_name: string, body: any) {
    // Admin check
    let claims = await backend.auth.internal.jwt_verify_decode(jwt_token);
    if (claims.roles.includes("admin")) {
      // continue
    } else {
      return { code: RESPONSE_CODE.ERROR_UNAUTHORIZED };
    }
    //
    let _id = new ObjectId(body._id);
    delete body._id;
    await internal.mongo.collection(collection_name).findOneAndUpdate(
      {
        _id,
      },
      {
        $set: body,
      }
    );
    return { code: RESPONSE_CODE.SUCCESS };
    //
  }
  // Logs
  async get_logs(jwt_token: string | undefined, { query, inc_meta }: { query: any; inc_meta: boolean }): Promise<any> {
    // Admin check
    let claims = await backend.auth.internal.jwt_verify_decode(jwt_token);
    if (claims.roles.includes("admin")) {
      // continue
    } else {
      return { code: RESPONSE_CODE.ERROR_UNAUTHORIZED };
    }
    //
    let result = await internal.mongo.collection("logs").find({}).sort({
      ts: -1,
    });
    let logs = await result.toArray();
    return {
      code: RESPONSE_CODE.SUCCESS,
      data_arr: logs,
    };
  }
  //
}
