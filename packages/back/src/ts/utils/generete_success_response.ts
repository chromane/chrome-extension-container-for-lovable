import { RESPONSE_CODE } from "@shared/types/common";
import { SuccessResponse } from "@shared/types/types";

export function generete_success_response<T>(input: T): SuccessResponse<T> {
  return {
    code: RESPONSE_CODE.SUCCESS,
    data: input,
  };
}
