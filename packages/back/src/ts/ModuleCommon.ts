import backend from './backend';
import config from '@shared/config';
import versions from '@shared/versions.json';
import internal from './internal';
import sgMail from '@sendgrid/mail';
import { RESPONSE_CODE } from '@shared/types/common';
import { encode_json } from '@shared/ts/helpers';
import { pretty_time } from '@shared/ts/parser';

export default class ModuleCommon {
  constructor() {}
  async ping() {
    return 'pong';
  }
  async versions() {
    return versions;
  }
  async send_user_feedback(data) {
    if (data.client_id === 'website') {
      sgMail.setApiKey(internal.secrets.sendgrid_api_key);
      //
      const msg = {
        to: ['vlas@chromane.com'],
        // to: ["vlas@chromane.com", "adampatch@gmail.com"],
        from: {
          email: 'bot@chromane.com',
          name: 'Bot Chromane',
        },
        subject: `Message from Demo Extension ${pretty_time(Date.now())}`,
        html: `
            <b>Name:</b><br></br>
            <i>${data.name}</i><br></br><br></br>
            <b>Email:</b><br></br>
            <i>${data.email}</i><br></br><br></br>
            <b>Message:</b><br></br>
            <i>${data.message}</i>
            `,
      };
      await sgMail.send(msg);
      return { code: RESPONSE_CODE.SUCCESS };
    } else {
      return null;
    }
  }

  async save_log(name: string, tags: Array<string>, json: any) {
    await internal.mongo.collection('logs').insertOne({
      name,
      tags,
      json: encode_json(json),
      ts: Date.now(),
    });
  }
}
