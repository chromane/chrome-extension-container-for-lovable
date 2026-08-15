import { UserDoc } from "@shared/types/common";
import internal from "../../ts/internal";
import { ObjectId } from "mongodb";

class UserService {
  async get_user_doc_by_email(email: string): Promise<null | UserDoc> {
    try {
      let result: any = await internal.mongo.collection("users").findOne({
        email,
      });
      return result;
    } catch (e) {
      return null;
    }
  }

  async get_user_by_id(_id: string): Promise<null | UserDoc> {
    try {
      let result: any = await internal.mongo.collection("users").findOne({
        _id: new ObjectId(_id),
      });
      return result;
    } catch (e) {
      return null;
    }
  }

  async update_user_doc(
    //
    _id: string,
    upd_data: Partial<Pick<UserDoc, "stripe_customer_id" | "status">>
  ): Promise<void> {
    await internal.mongo.collection("users").updateOne(
      //
      { _id: new ObjectId(_id) },
      { $set: upd_data },
      { upsert: true }
    );
  }

  get_user_doc_default({
    email,
    pw_encrypted,
    stripe_customer_id,
    auth_provider,
  }: Pick<UserDoc, "auth_provider" | "email" | "pw_encrypted" | "stripe_customer_id">): UserDoc {
    let user_doc: UserDoc = {
      _id: "_default_",
      email,
      auth_provider,
      pw_encrypted,
      roles: ["user"],
      credits: 0,
      details: [],
      ts_created: Date.now(),
      locale: "en",
      // Subsc
      stripe_customer_id,
      status: "free",
    };

    return user_doc;
  }
}

const user_service = new UserService();
export { user_service };
