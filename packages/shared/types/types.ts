import { JwtClaims, RESPONSE_CODE, ResponseCodeError } from './common';

export type ResponseCode = typeof RESPONSE_CODE.SUCCESS | ResponseCodeError;

export type ErrorResponse = {
  code: ResponseCodeError;
  error?: string;
  data?: any;
};
export type SuccessResponse<D> = {
  code: typeof RESPONSE_CODE.SUCCESS;
  data: D;
};

export type ChromeStorage = {
  [key: string]: any;
  settings: any;
  auth: null | {
    jwt_token: string;
    jwt_claims: JwtClaims;
  };
  credits: number;
  //
};

export type AuthStore = {
  jwt_token: string;
  jwt_claims: JwtClaims;
};
