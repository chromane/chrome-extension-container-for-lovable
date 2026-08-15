// todo: expire token
import { user_service } from "./services/UserService";
import { encode_url_state } from "@shared/ts/helpers";
import Stripe from "stripe";
import { BackendResponseBase, RESPONSE_CODE, UserDoc } from "@shared/types/common";
import get_url from "@shared/get_url";
import backend from "./backend";
import internal from "./internal";
import { SubPriceFormatID, SubscriptionDoc } from "@shared/types/subscription";
import { ObjectId } from "mongodb";

class StripeService {
  async generate_stripe_customer_id(email: string) {
    let stripe_customer = await internal.stripe.customers.create({
      email,
      metadata: { extension: "demo" },
    });
    return stripe_customer.id;
  }

  async generate_or_get_user_stripe_customer_id(email: string) {
    const user = await user_service.get_user_doc_by_email(email);
    if (!user) {
      throw new Error(`Can not get user doc by email:[${email}]`);
    }

    if (user.stripe_customer_id && user.stripe_customer_id !== "_no_id_") {
      return user.stripe_customer_id;
    }

    let stripe_customer_id = await this.generate_stripe_customer_id(email);

    await user_service.update_user_doc(user._id.toString(), { stripe_customer_id: stripe_customer_id });
    return stripe_customer_id;
  }

  str_arr_to_str(input: string | string[] | undefined) {
    if (input instanceof Array) {
      if (input[0]) {
        return input[0];
      } else {
        return "";
      }
    } else if (input) {
      return input;
    } else {
      return "";
    }
  }

  customer_to_custom_subsc_data(customer: Stripe.Customer): { status: SubStatus; price_format_id: SubPriceFormatID; subscription_id: string } {
    try {
      let premium_product_id: string = StripeConfig.premium_product_id;

      let sub_data_arr = customer.subscriptions?.data || [];

      for (let sub_data of sub_data_arr) {
        if (sub_data.status === "active" || sub_data.status === "trialing") {
          try {
            const price_obj = sub_data.items.data[0].price;
            if (price_obj.product === premium_product_id) {
              const price_format_id = stripe_service.get_price_id_format({ price_id: price_obj.id });
              return { status: "premium", price_format_id, subscription_id: sub_data.id };
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      return { status: "free", price_format_id: "free", subscription_id: "" };
    }
    return { status: "free", price_format_id: "free", subscription_id: "" };
  }

  async check_and_update_subscription(customer_id: string) {
    let customer = await internal.stripe.customers.retrieve(customer_id, { expand: ["subscriptions"] });

    if (customer.deleted !== true) {
      let subsc_data = this.customer_to_custom_subsc_data(customer);
      let result: any = await internal.mongo.collection(FB_COLL.USERS).findOne({ stripe_customer_id: customer.id });
      const user_doc: null | UserDoc = result;

      if (user_doc === null) {
        throw new Error(`Could not get user by given Stripe ID:[${customer.id}]`);
      }

      await user_service.update_user_doc(user_doc._id.toString(), {
        status: subsc_data.status,
        price_id_format: subsc_data.price_format_id,
      });

      if (subsc_data.status === "free") {
        await internal.mongo.collection(FB_COLL.SUBSCRIPTIONS).findOneAndDelete({
          user_id: new ObjectId(user_doc._id.toString()),
        });
      } else {
        // const subsc_doc: SubscriptionDoc = {
        try {
          const subsc_doc: any = {
            // _id: new ObjectId(user_doc._id.toString()),
            user_id: new ObjectId(user_doc._id.toString()),
            customer_id: customer_id,
            price_format_id: subsc_data.price_format_id,
            product: subsc_data.status,
            subscription_id: subsc_data.subscription_id,
          };
          await internal.mongo.collection(FB_COLL.SUBSCRIPTIONS).updateOne(
            {
              _id: new ObjectId(user_doc._id.toString()),
            },
            {
              $set: subsc_doc,
            },
            { upsert: true }
          );
        } catch (error) {
          console.log("error", error);
        }
      }
    }
  }

  // async customer_delete(req) {
  // let { stripe } = this.get_stripe_instance();
  // var decoded_token = await admin.auth().verifyIdToken(req.body.token);
  // var user_ref = this.db.collection("users").doc(decoded_token.uid);
  // var doc = await user_ref.get();
  // var user_data = doc.data();
  // if (user_data) {
  //   if (user_data.stripe_customer_id) {
  //     try {
  //       await stripe.customers.del(user_data.stripe_customer_id);
  //     } catch (e) {}
  //   }
  //   await admin.auth().deleteUser(decoded_token.uid);
  //   await user_ref.delete();
  // }
  // return { deleted: true };
  // }
}

const stripe_service = new StripeService();

export default class ModuleStripe {
  //
  async create_checkout_session(jwt_token: string, product_id: SubPriceFormatID, iframe_id: string): Promise<BackendResponseBase<{ url: string }>> {
    let jwt_claims = backend.auth.internal.jwt_verify_decode(jwt_token);
    let price_id = internal.secrets.stripe_price_id;
    let success_url = `${get_url("backend_root")}/common-redirect?state=${
      //
      encode_url_state({
        //
        iframe_id,
        event_name: "payment_confirmation",
      })
    }`;
    let cancel_url = `${get_url("backend_root")}/common-redirect?state=${
      //
      encode_url_state({
        //
        iframe_id,
        event_name: "payment_cancel",
      })
    }`;

    // let customer_id = jwt_claims.stripe_customer_id;

    // if (customer_id === false || customer_id === "_no_id_") {
    let customer_id = await stripe_service.generate_or_get_user_stripe_customer_id(jwt_claims.email);
    // }

    if (!customer_id) {
      return {
        code: RESPONSE_CODE.ERROR_UNKNOWN,
        error: "Could not get Stripe Customer ID",
      };
    }

    const session = await internal.stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer_id,
      payment_method_types: ["card"],
      allow_promotion_codes: true,

      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url,
      cancel_url,
    });
    if (session.url) {
      return {
        code: RESPONSE_CODE.SUCCESS,
        data: { url: session.url },
      };
    } else {
      return {
        code: RESPONSE_CODE.ERROR_UNKNOWN,
      };
    }
  }
  async create_customer_portal_session(jwt_token, iframe_id: string): Promise<BackendResponseBase<{ url: string }>> {
    let jwt_claims = backend.auth.internal.jwt_verify_decode(jwt_token);
    console.log(
      encode_url_state({
        //
        iframe_id,
        event_name: "stripe_portal_return",
      })
    );
    let return_url = `${get_url("backend_root")}/common-redirect?state=${
      //
      encode_url_state({
        //
        iframe_id,
        event_name: "stripe_portal_return",
      })
    }`;
    const session = await internal.stripe.billingPortal.sessions.create({
      customer: jwt_claims.stripe_customer_id,
      return_url,
    });
    return {
      code: RESPONSE_CODE.SUCCESS,
      data: { url: session.url },
    };
  }
  //
  async change_subscription() {}
  async webhook(req: any) {}
}
