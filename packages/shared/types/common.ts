import type { ErrorResponse, SuccessResponse } from './types';

export enum ConfigMode {
  test = 'test', // when compiling for testing in dev server
  dev = 'dev', // when compiling for temp_extension_install
  prod = 'prod', // production
}

export interface INotification {
  text: string;
  type: 'error' | 'success';
  id?: string;
}

export interface DomainData {
  domain: string;
  selector: string;
}

export enum UserStatus {
  new = 'new',
  extension_user = 'extension_user',
  admin = 'admin',
}

export interface INotification {
  text: string;
  type: 'error' | 'success';
  id?: string;
}

export interface DomainData {
  domain: string;
  selector: string;
}

export const RESPONSE_CODE = {
  SUCCESS: 200,
  ERROR_UNAUTHORIZED: 401,
  ERROR_TOKEN_EXPIRED: 402,
  ERROR_FORBIDDEN: 403,
  ERROR_NOT_FOUND: 404,
  ERROR_SUBSCRIPTION_REQUIRED: 406,

  ERROR_INPUT: 422,
  ERROR_ALREADY_EXISTS: 601,
  ERROR_UNKNOWN: 602,
  ERROR_AUTH_WRONG_PW: 603,
} as const;

export type ResponseCodeType = (typeof RESPONSE_CODE)[keyof typeof RESPONSE_CODE];

export type ResponseCodeError =
  | typeof RESPONSE_CODE.ERROR_UNAUTHORIZED //
  | typeof RESPONSE_CODE.ERROR_FORBIDDEN
  | typeof RESPONSE_CODE.ERROR_NOT_FOUND
  | typeof RESPONSE_CODE.ERROR_INPUT
  | typeof RESPONSE_CODE.ERROR_AUTH_WRONG_PW
  | typeof RESPONSE_CODE.ERROR_SUBSCRIPTION_REQUIRED
  | typeof RESPONSE_CODE.ERROR_ALREADY_EXISTS
  | typeof RESPONSE_CODE.ERROR_UNKNOWN;

export type ResponseCode = typeof RESPONSE_CODE.SUCCESS | ResponseCodeError;

export type UserRole = 'user' | 'admin' | 'tester' | 'anon';

export type UserTag = 'anon' | 'unlocked' | 'unlocked_all_features' | 'unlocked_email_finder_only';

export type UserDoc = {
  _id: string;
  pw_encrypted: string;
  email: string;
  credits: number;
  auth_provider: 'email' | 'google';
  roles: Array<UserRole>;
  // Array of arbitrary strings, used for testing,
  // metrics or for other simple out of scope features
  tags: Array<UserTag>;
  ts_created: number;
  stripe_customer_id: string;
  status: string;
  //
};

export type JwtClaims = Pick<
  UserDoc,
  | '_id'
  | 'email'
  | 'status'
  //
  | 'tags'
> & {};

// Old chromane_extension types
export type BackendResponse<TypeVar> = {
  success: Boolean;
  code: string;
  result: TypeVar;
};

export type BackendResponseBase<D> = ErrorResponse | SuccessResponse<D>;

export type TopPageName = 'add_tag_page' | 'extension_page';
