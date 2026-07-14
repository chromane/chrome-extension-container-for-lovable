import { encode_jwt } from '@shared/ts/helpers';
import { JwtClaims } from '@shared/types/common';

let jwt_claims: JwtClaims = {
  _id: '',
  ts_created: 0,
  credits: 99,
  stripe_customer_id: '',
  email: 'anon@anon.com',
  roles: ['anon'],
  tags: ['anon'],
  status: 'free',
};

export default function get_anon_auth() {
  return {
    jwt_token: encode_jwt({}, jwt_claims, {}),
    jwt_claims: jwt_claims,
  };
}
