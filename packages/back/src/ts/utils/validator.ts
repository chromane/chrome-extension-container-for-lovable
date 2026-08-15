import { RESPONSE_CODE } from "@shared/types/common";
import { ErrorResponse } from "@shared/types/types";

type ValidateResponse = { passed: false; error: ErrorResponse } | { passed: true };

class Validator {
  private create_error_input_response(error?: string): ValidateResponse {
    return {
      passed: false,
      error: {
        code: RESPONSE_CODE.ERROR_INPUT,
        error,
      },
    };
  }

  all_fields_required<T extends Record<string, any>>(obj: T, fields: (keyof T)[]): ValidateResponse {
    for (const field of fields) {
      if (!obj[field]) {
        return this.create_error_input_response(`Field [${field.toString()}] is required`);
      }
    }

    return { passed: true };
  }
}

const validator = new Validator();

export { validator };
