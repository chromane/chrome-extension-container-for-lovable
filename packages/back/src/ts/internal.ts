import { Bucket, Storage } from '@google-cloud/storage';
import secrets from '@root/.secrets.json';
import config from '@shared/config';
import config_json from '@shared/config.json';
import OpenAI from 'openai';
import { Db, MongoClient } from 'mongodb';
import Stripe from 'stripe';
import console_log from '@shared/ts/console_log';

class Internal {
  mongo: Db;
  // bucket: Bucket;
  secrets = secrets;
  config = config;
  openai: OpenAI;
  // stripe: Stripe;
  constructor() {
    //
    let mongo_client;
    // if (config.mode === 'dev') {
    //   //
    //   let mongo_string = `mongodb://${secrets.mongo_username}:${secrets.mongo_password}@${secrets.mongo_ip_remote}:${secrets.mongo_port}`;
    //   console_log('mongo_string', mongo_string);
    //   mongo_client = new MongoClient(mongo_string);
    // } else {
    //   mongo_client = new MongoClient(`mongodb://${secrets.mongo_username}:${secrets.mongo_password}@${secrets.mongo_ip_local}:${secrets.mongo_port}`);
    // }

    // this.mongo = mongo_client.db('main');

    // const storage = new Storage();

    // this.bucket = storage.bucket(config_json.gc_public_bucket_id);

    // this.openai = new OpenAI({
    //   apiKey: secrets.openai_api_key,
    // });

    // this.stripe = new Stripe(secrets.stripe_api_key_secret, {
    //   apiVersion: '2025-03-31.basil',
    // });
  }
}

export default new Internal();
