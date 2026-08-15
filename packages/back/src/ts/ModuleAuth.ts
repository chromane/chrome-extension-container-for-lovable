import { decode_jwt, get_code } from "@shared/ts/helpers";
import sgMail from "@sendgrid/mail";
import crypto from "crypto";
import JWT from "jsonwebtoken";
import { JwtClaims, UserDoc, RESPONSE_CODE, ResponseCodeError, BackendResponseBase, UserSession } from "@shared/types/common";
import internal from "./internal";
import backend from "../ts/backend";
import { user_service } from "./services/UserService";
import { generete_success_response } from "./utils/generete_success_response";
import { ObjectId } from "mongodb";
import console_log from "@shared/ts/console_log";

type AuthResponse = {
  code: typeof RESPONSE_CODE.SUCCESS;
  jwt_token: string;
};
type ErrorResponse = {
  code: ResponseCodeError;
  error?: string;
};
type SuccessResponse = {
  code: typeof RESPONSE_CODE.SUCCESS;
};

class Internal {
  async send_code(email: string): Promise<void> {
    let code = get_code();
    //
    await internal.mongo.collection("codes").insertOne({
      _id: new ObjectId(),
      email,
      code,
    });
    //
    sgMail.setApiKey(internal.secrets.sendgrid_api_key);
    const msg = {
      to: email,
      from: {
        email: "help@chromane-auto-lister.com",
        name: "chromane-auto-lister",
      },
      subject: "Verify your email for the chromane-auto-lister chrome extension.",
      html: `<p>Please use thise code to verify your email:</p><p><strong>${code}</strong></p>`,
    };
    //ES6
    await sgMail.send(msg);
  }
  doc_to_claims(doc: UserDoc): JwtClaims {
    return {
      _id: doc._id,
      status: doc.status,
      email: doc.email,
      stripe_customer_id: doc.stripe_customer_id,
      roles: doc.roles,
      credits: doc.credits,
      locale: doc.locale,
      ts_created: doc.ts_created,
    };
  }
  create_jwt(claims: JwtClaims, jwt_options: JWT.SignOptions = { expiresIn: "31d" }): string {
    // @ts-ignore
    delete claims.exp;
    return JWT.sign(claims, internal.secrets.google_client_secret, jwt_options);
  }
  create_jwt_custom(claims: any, jwt_options: JWT.SignOptions = { expiresIn: "31d" }): string {
    // @ts-ignore
    delete claims.exp;
    return JWT.sign(claims, internal.secrets.google_client_secret, jwt_options);
  }
  async find_code(email_code: string, email: string) {
    let result = await internal.mongo.collection("codes").findOne({
      email,
      code: email_code,
    });
    return result;
  }
  pw_encrypt(pw) {
    let salt = internal.secrets.google_client_secret;
    let result = crypto
      .createHash("sha256")
      .update(pw + salt)
      .digest("base64");
    return result;
  }
  jwt_verify_decode(jwt_token) {
    try {
      JWT.verify(jwt_token, internal.secrets.google_client_secret);
      let jwt_claims = JWT.decode(jwt_token) as JwtClaims;
      return jwt_claims;
    } catch (error) {
      console.log("jwt_verify_error", error);
      throw { code: RESPONSE_CODE.ERROR_TOKEN_EXPIRED };
    }
  }
  async create_new_account_provider_email(email: string, pass: string): Promise<AuthResponse> {
    const stripe_customer_id = "_no_id_";

    let user_doc = user_service.get_user_doc_default({
      email,
      pw_encrypted: this.pw_encrypt(pass),
      stripe_customer_id,
      auth_provider: "email",
    });

    // @ts-ignore
    user_doc._id = new ObjectId();
    // @ts-ignore
    await internal.mongo.collection("users").insertOne(user_doc);

    return {
      code: RESPONSE_CODE.SUCCESS,
      jwt_token: this.create_jwt(this.doc_to_claims(user_doc)),
    };
  }
  async create_new_account_provider_google(email: string): Promise<AuthResponse> {
    const stripe_customer_id = "_no_id_";

    let user_doc = user_service.get_user_doc_default({
      auth_provider: "google",
      email,
      pw_encrypted: "",
      stripe_customer_id,
    });

    // @ts-ignore
    user_doc._id = new ObjectId();
    // @ts-ignore
    await internal.mongo.collection("users").insertOne(user_doc);

    return {
      code: RESPONSE_CODE.SUCCESS,
      jwt_token: this.create_jwt(this.doc_to_claims(user_doc)),
    };
  }
}

export default class ModuleAuth {
  internal: Internal;
  constructor() {
    this.internal = new Internal();
  }
  async redirect(query_params) {
    return {
      _redirect: true,
      location: `chrome-extension://${internal.config.extension_id}/pages/redirect/index.html?code=${query_params.code}&state=${query_params.state}&event_name=${query_params.event_name}`,
    };
  }
  // auth => delete_user
  async delete_user(jwt_token: string): Promise<SuccessResponse | ErrorResponse> {
    let jwt_claims = backend.auth.internal.jwt_verify_decode(jwt_token);
    await internal.mongo.collection("users").findOneAndDelete({
      _id: new ObjectId(jwt_claims._id),
    });
    await internal.mongo.collection("user_settings").findOneAndDelete({
      _id: new ObjectId(jwt_claims._id),
    });
    try {
      // await internal.stripe.customers.del(jwt_claims.stripe_customer_id);
    } catch (error) {
      console.log("error", error);
    }
    await backend.common.save_log("user_deleted", [], { email: jwt_claims.email });
    return {
      code: RESPONSE_CODE.SUCCESS,
    };
    // try {
    //   if (!user_doc_id.length) {
    //     return {
    //       status: false,
    //       error: "Empty user_doc_id",
    //     };
    //   }
    //   if (!email.length) {
    //     return {
    //       status: false,
    //       error: "Empty email",
    //     };
    //   }

    //   let is_delete_old_code = false;
    //   // delete all codes related to user's email
    //   // const delete_code_by_email_response = await this.delete_code_by_email(email);

    //   if (is_delete_old_code) {

    //     return {
    //       status: true,
    //     };
    //   }

    //   const error = `Deleting user error: \n is_delete_old_code: ${is_delete_old_code}`;
    //   console.log(error);
    //   return {
    //     status: false,
    //     error,
    //   };
    // } catch (error) {
    //   return {
    //     status: false,
    //     error,
    //   };
    // }
  }
  // stripe => update user
  async update_user_after_payment_confirmation(jwt_token: string) {}
  // provider:email => create_account
  async create_account_step_one(email: string): Promise<ErrorResponse | SuccessResponse> {
    try {
      if (!email.length) {
        return {
          code: RESPONSE_CODE.ERROR_INPUT,
          error: "Empty email",
        };
      }
      let user_doc = await user_service.get_user_doc_by_email(email);
      if (user_doc !== null) {
        return {
          code: RESPONSE_CODE.ERROR_ALREADY_EXISTS,
        };
      } else {
        await this.internal.send_code(email);
        return {
          code: RESPONSE_CODE.SUCCESS,
        };
      }
    } catch (error) {
      console.log("error", error);
      return {
        code: RESPONSE_CODE.ERROR_UNKNOWN,
        error: "Unexpected error.",
      };
    }
  }
  async create_account_step_two(email_code: string, email: string, pass: string): Promise<ErrorResponse | AuthResponse> {
    if (!email.length) {
      return {
        code: RESPONSE_CODE.ERROR_INPUT,
        error: "Empty email",
      };
    }
    if (!email_code.length) {
      return {
        code: RESPONSE_CODE.ERROR_INPUT,
        error: "Empty email",
      };
    }

    let code = await this.internal.find_code(email_code, email);

    if (code === null) {
      return {
        code: RESPONSE_CODE.ERROR_NOT_FOUND,
      };
    }

    let user_doc = await user_service.get_user_doc_by_email(email);

    if (user_doc !== null) {
      return {
        code: RESPONSE_CODE.ERROR_ALREADY_EXISTS,
      };
    }
    return await this.internal.create_new_account_provider_email(email, pass);
  }
  // provider:email => log_in
  async log_in(input_email: string, input_pass: string): Promise<ErrorResponse | AuthResponse> {
    if (!input_email.length) {
      return {
        code: RESPONSE_CODE.ERROR_INPUT,
        error: "Empty email",
      };
    }
    const user_doc = await user_service.get_user_doc_by_email(input_email);
    if (user_doc !== null) {
      let pw_encrypted = this.internal.pw_encrypt(input_pass);
      if (user_doc.pw_encrypted === pw_encrypted) {
        console.log("user_doc", user_doc);
        await backend.common.save_log("user_logged_in_with_email", [], { email: user_doc.email });
        return {
          code: RESPONSE_CODE.SUCCESS,
          jwt_token: this.internal.create_jwt(this.internal.doc_to_claims(user_doc)),
        };
      } else {
        return {
          code: RESPONSE_CODE.ERROR_AUTH_WRONG_PW,
        };
      }
    } else {
      return {
        code: RESPONSE_CODE.ERROR_NOT_FOUND,
      };
    }
  }
  // provider:email => reset_pass
  async reset_pass_step_one(email: string): Promise<ErrorResponse | SuccessResponse> {
    if (!email.length) {
      return {
        code: RESPONSE_CODE.ERROR_INPUT,
        error: "Empty email",
      };
    }
    let user_doc = await user_service.get_user_doc_by_email(email);
    if (user_doc === null) {
      return {
        code: RESPONSE_CODE.ERROR_NOT_FOUND,
      };
    } else {
      await this.internal.send_code(email);
      return {
        code: RESPONSE_CODE.SUCCESS,
      };
    }
  }
  async reset_pass_step_two(email_code: string, email: string): Promise<ErrorResponse | SuccessResponse> {
    if (!email.length) {
      return {
        code: RESPONSE_CODE.ERROR_INPUT,
        error: "Empty email",
      };
    }
    let code = await this.internal.find_code(email_code, email);
    if (code) {
      return {
        code: RESPONSE_CODE.SUCCESS,
      };
    } else {
      return {
        code: RESPONSE_CODE.ERROR_NOT_FOUND,
      };
    }
  }
  async reset_pass_step_three(email_code: string, email: string, new_pass: string): Promise<ErrorResponse | AuthResponse> {
    if (!new_pass.length) {
      return {
        code: RESPONSE_CODE.ERROR_INPUT,
        error: "Empty password",
      };
    }

    if (!email.length) {
      return {
        code: RESPONSE_CODE.ERROR_INPUT,
        error: "Empty email",
      };
    }

    let code = await this.internal.find_code(email_code, email);
    if (code) {
      let user_doc = await user_service.get_user_doc_by_email(email);
      if (user_doc === null) {
        return {
          code: RESPONSE_CODE.ERROR_NOT_FOUND,
        };
      } else {
        const new_encrypted_pass = this.internal.pw_encrypt(new_pass);
        await internal.mongo.collection("users").findOneAndUpdate(
          {
            uid: new ObjectId(user_doc._id),
          },
          {
            $set: {
              pw_encrypted: new_encrypted_pass,
            },
          }
        );
        return {
          code: RESPONSE_CODE.SUCCESS,
          jwt_token: this.internal.create_jwt(this.internal.doc_to_claims(user_doc)),
        };
      }
    } else {
      return {
        code: RESPONSE_CODE.ERROR_NOT_FOUND,
      };
    }
  }
  // provider:google => sign_in_with_google_code
  async sign_in_with_google_code(code: string, redirect_uri): Promise<ErrorResponse | AuthResponse> {
    console.log("sign_in_with_google_code", code, redirect_uri);
    var tokens = await this.google_code_to_tokens(code, redirect_uri);
    console.log("tokens", tokens);
    if (tokens && tokens.id_token) {
      let claims = decode_jwt(tokens.id_token);
      if (claims.email && claims.email_verified) {
        //
        let user_doc;
        //
        // todo: remove in prod
        user_doc = await user_service.get_user_doc_by_email(claims.email);
        // user_doc = await user_service.get_user_doc_by_email("adampatch@gmail.com");
        // user_doc = await user_service.get_user_doc_by_email("adam@adampatch.com");
        //
        if (user_doc) {
          await backend.common.save_log("user_logged_in_with_google", [], { email: user_doc.email });
          return {
            code: RESPONSE_CODE.SUCCESS,
            jwt_token: this.internal.create_jwt(this.internal.doc_to_claims(user_doc)),
          };
        } else {
          await backend.common.save_log("user_created_account_with_google", [], { email: claims.email });
          return await this.internal.create_new_account_provider_google(claims.email);
        }
      } else {
        return {
          code: RESPONSE_CODE.ERROR_UNKNOWN,
        };
      }
    } else {
      return {
        code: RESPONSE_CODE.ERROR_UNKNOWN,
      };
    }
  }
  async jwt_refresh(jwt_token: string) {
    let claims = await this.internal.jwt_verify_decode(jwt_token);
    let result: any = await internal.mongo.collection("users").findOne({
      _id: new ObjectId(claims._id),
    });
    let user_doc = result as UserDoc;
    // console_log("user_doc", claims, user_doc);
    let jwt_token_new = this.internal.create_jwt(this.internal.doc_to_claims(user_doc));
    return { jwt_token: jwt_token_new };
  }
  async get_user_session(jwt_token: any): Promise<BackendResponseBase<UserSession>> {
    let claims = this.internal.jwt_verify_decode(jwt_token);

    const data = await user_service.get_user_by_id(claims._id);

    if (!data) {
      return {
        code: RESPONSE_CODE.ERROR_UNAUTHORIZED,
      };
    }

    // console_log("data", data);

    return generete_success_response(data);
  }
  // new google auth REST-only methods
  async google_code_to_tokens(code, redirect_uri) {
    let result = await fetch(`https://oauth2.googleapis.com/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: internal.config.google_client_id,
        client_secret: internal.secrets.google_client_secret,
        redirect_uri,
        grant_type: "authorization_code",
        access_type: "offline",
      }),
    });
    let json = await result.json();
    return json;
  }
  async google_refresh_token(refresh_token, redirect_uri) {
    let result = await fetch(`https://oauth2.googleapis.com/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: internal.config.google_client_id,
        client_secret: internal.secrets.google_client_secret,
        redirect_uri,
        refresh_token,
        grant_type: "refresh_token",
        access_type: "offline",
      }),
    });
    let json = await result.json();
    return json;
  }
}
