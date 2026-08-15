import { RESPONSE_CODE } from '@shared/types/common';
import ControllerServer from './ControllerServer';
import { MongoClient, ObjectId } from 'mongodb';
import sgMail from '@sendgrid/mail';
//
import { get_element_data, get_id, wait, wait_for_element } from '@shared/ts/helpers';
import internal from './internal';
import backend from './backend';
import console_log from '@shared/ts/console_log';
import { UserSettings } from '@shared/types/project';
import fs from 'fs';
import fs_extra from 'fs-extra';
import * as jimp from 'jimp';
import { toFile } from 'openai';
import Vision from '@google-cloud/vision';
import path from 'path';
import dirnames from '../../../../dirnames.js';
//
//
import { GoogleGenAI, Modality } from '@google/genai';
import { pretty_time } from '@shared/ts/parser';

// async function main() {
//     // const pdfResp = await fetch('https://discovery.ucl.ac.uk/id/eprint/10089234/1/343019_3_art_0_py4t4l_convrt.pdf')
//     //     .then((response) => response.arrayBuffer());

// }

// main();
//
//

export default class ModuleProject {
  constructor() {}
  async update_user_settings(jwt_token: any, new_settings: any) {
    let jwt_claims = backend.auth.internal.jwt_verify_decode(jwt_token);
    delete new_settings._id;
    await internal.mongo.collection('user_settings').findOneAndUpdate(
      {
        _id: new ObjectId(jwt_claims._id),
      },
      {
        $set: new_settings,
      },
      { upsert: true }
    );
    //
    let result: any = await internal.mongo.collection('user_settings').findOne({
      _id: new ObjectId(jwt_claims._id),
    });
    let user_settings = result as UserSettings;
    return { code: RESPONSE_CODE.SUCCESS, user_settings };
  }
  async get_user_settings(jwt_token: any) {
    let jwt_claims = backend.auth.internal.jwt_verify_decode(jwt_token);
    let result: any = await internal.mongo.collection('user_settings').findOne({
      _id: new ObjectId(jwt_claims._id),
    });
    result = result || {};
    let user_settings: UserSettings = result as UserSettings;
    return { code: RESPONSE_CODE.SUCCESS, user_settings };
  }
  //
  async process_image_src(image_src) {
    // load image
    let fetch_result = await fetch(image_src);
    let image_buffer = await fetch_result.arrayBuffer();
    fs.writeFileSync('./image.jpg', Buffer.from(new Uint8Array(image_buffer)));
    // convert to png
    let jimp_image = await jimp.Jimp.read('./image.jpg');
    await jimp_image.write('./image.png');
    // extract text
    const vision_client = new Vision.ImageAnnotatorClient();

    const [result] = await vision_client.textDetection(`./image.jpg`);
    // let request = {
    //   requests: [],
    // } as any;
    // request.requests.push({
    //   image: {
    //     source: {
    //       imageUri: image_src,
    //     },
    //   },
    //   features: [
    //     {
    //       type: 'TEXT_DETECTION',
    //       maxResults: 50,
    //     },
    //     // {
    //     //   type: "DOCUMENT_TEXT_DETECTION",
    //     //   maxResults: 50,
    //     // },
    //     // {
    //     //   type: 'OBJECT_LOCALIZATION',
    //     //   maxResults: 50,
    //     // },
    //   ],
    // });
    //
    // let vision_result = await vision.batchAnnotateImages(request);
    // console_log('vision_result', vision_result);
    // return
    return { code: RESPONSE_CODE.SUCCESS, vision_result: result };
  }
  async process_image_src_old_anime(image_src) {
    // load image
    let result = await fetch(image_src);
    let image_buffer = await result.arrayBuffer();
    fs.writeFileSync('./image.jpg', Buffer.from(new Uint8Array(image_buffer)));
    // convert to png
    let jimp_image = await jimp.Jimp.read('./image.jpg');
    await jimp_image.write('./image.png');
    // create variation
    const image_result = await internal.openai.images.edit({
      image: await toFile(fs.createReadStream('./image.jpg'), null, {
        type: 'image/jpeg',
      }),
      // model: 'dall-e-2',
      model: 'gpt-image-1',
      n: 1,
      // response_format: 'url',
      // size: `512x512`,
      size: `1024x1024`,
      // prompt: `restyle image in studio ghibli style, keep all details`,
      prompt: `Convert this image into an AI Anime Avatar`,
    });
    console_log('image_result', image_result);
    // return
    return { code: RESPONSE_CODE.SUCCESS, image_result };
  }
  async process_image_openai(image_base64: string, prompt: string) {
    // let base64_data = image_base64.replace(/data:.+,/, '');
    const response = await internal.openai.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: prompt,
            },
            {
              type: 'input_image',
              image_url: image_base64,
              detail: 'auto',
            },
          ],
        },
      ],
    });
    return {
      code: RESPONSE_CODE.SUCCESS,
      response,
    };
  }
  async process_image_google_unblur(image_base64: string, prompt: string) {
    //
    let path_temp_folder = path.resolve(dirnames.root, 'temp');
    fs_extra.removeSync(path_temp_folder);
    fs_extra.ensureDirSync(path.resolve(dirnames.root, 'temp')); // Make sure the folder exists
    //
    let base64_data = image_base64.replace(/data:.+,/, '');
    //save file locally in `/temp/`
    fs_extra.ensureDirSync(path.resolve(dirnames.root, 'temp')); // Make sure the folder exists
    fs.writeFileSync(path.resolve(dirnames.root, 'temp', 'image.png'), base64_data, 'base64');

    //
    const ai = new GoogleGenAI({ apiKey: internal.secrets.google_project_chromane_demo_gemini_api_key });

    let file = fs.readFileSync(path.resolve(dirnames.root, 'temp', 'image.png'));
    // let buffer =
    const contents = [
      { text: 'Unblur this image' },
      {
        inlineData: {
          mimeType: 'image/png',
          data: Buffer.from(file).toString('base64'),
        },
      },
    ];
    // gemini-2.5-flash has thinking on by default for enhanced accuracy
    // you can adjust it to minimize latency/token usage (refer to documentation)
    const response = await ai.models.generateContent({
      // model: "gemini-2.5-flash",
      model: 'gemini-2.0-flash-preview-image-generation',
      // model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });
    console.log('response', response);
    console.log('response', response.text);
    return {
      code: RESPONSE_CODE.SUCCESS,
      output_text: response.text,
    };
  }
  async process_pdf(doc_base64) {
    //
    let path_temp_folder = path.resolve(dirnames.root, 'temp');
    fs_extra.removeSync(path_temp_folder);
    fs_extra.ensureDirSync(path.resolve(dirnames.root, 'temp')); // Make sure the folder exists
    //
    let base64_data = doc_base64.replace(/data:.+,/, '');
    //save file locally in `/temp/`
    fs_extra.ensureDirSync(path.resolve(dirnames.root, 'temp')); // Make sure the folder exists
    fs.writeFileSync(path.resolve(dirnames.root, 'temp', 'document.pdf'), base64_data, 'base64');

    //
    const ai = new GoogleGenAI({ apiKey: internal.secrets.google_project_chromane_demo_gemini_api_key });

    let file = fs.readFileSync(path.resolve(dirnames.root, 'temp', 'document.pdf'));
    // let buffer =
    const contents = [
      { text: 'Summarize this document' },
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: Buffer.from(file).toString('base64'),
        },
      },
    ];
    // gemini-2.5-flash has thinking on by default for enhanced accuracy
    // you can adjust it to minimize latency/token usage (refer to documentation)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
    });
    console.log(response.text);
    return response.text;
  }
  //
  async paraphrase(selected_text: string) {
    //
    // const ai = new GoogleGenAI({ apiKey: internal.secrets.google_project_chromane_demo_gemini_api_key });
    //
    // gemini-2.5-flash has thinking on by default for enhanced accuracy
    // you can adjust it to minimize latency/token usage (refer to documentation)
    // const response = await ai.models.generateContent({
    //   model: 'gemini-2.5-flash',
    //   contents: [
    //     // system instruction as the first content item
    //     { text: 'System: You are a concise paraphrasing assistant. Only return the paraphrased text without added commentary.' },
    //     { text: selected_text },
    //   ],
    // });
    // console.log(response.text);
    // return response.text;
    // return '123';
    const response = await internal.openai.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: 'System: You are a concise paraphrasing assistant. Only return the paraphrased text without added commentary.',
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: selected_text,
            },
          ],
        },
      ],
    });
    console_log('response', response);
    return response.output_text;
    //
  }
  async generate_thread_openai(selected_text: string) {
    //
    // const ai = new GoogleGenAI({ apiKey: internal.secrets.google_project_chromane_demo_gemini_api_key });
    //
    // gemini-2.5-flash has thinking on by default for enhanced accuracy
    // you can adjust it to minimize latency/token usage (refer to documentation)
    // const response = await ai.models.generateContent({
    //   model: 'gemini-2.5-flash',
    //   contents: [
    //     // system instruction as the first content item
    //     { text: 'System: You are a concise paraphrasing assistant. Only return the paraphrased text without added commentary.' },
    //     { text: selected_text },
    //   ],
    // });
    // console.log(response.text);
    // return response.text;
    // return '123';
    const response = await internal.openai.responses.create({
      model: 'gpt-4.1-mini',
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: 'System: You are a master online social media inlfuencer. Only return the text of the post on threads.net without added commentary.',
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: selected_text,
            },
          ],
        },
      ],
    });
    console_log('response', response);
    return response.output_text;
    //
  }
}
