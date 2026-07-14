<script setup lang="ts">
// todo: clicking enter should trigger the auth sending

import { RESPONSE_CODE } from '@shared/types/common';
//
import local_google from '@src/svg/google.svg?raw';
import mdi_mail from '@mdi/svg/svg/email-outline.svg?raw';
import mdi_eye_off from '@mdi/svg/svg/eye-off.svg?raw';
import mdi_eye from '@mdi/svg/svg/eye.svg?raw';
import mdi_key from '@mdi/svg/svg/key-variant.svg?raw';
import mdi_info_box from '@mdi/svg/svg/information-box.svg?raw';

import Button from '@src/vue/comp/Button.vue';
import MessageSimple from '@src/vue/comp/MessageSimple.vue';

import CardError from '@src/vue/comp/CardError.vue';
import Divider from '@src/vue/comp/Divider.vue';
import { reactive } from 'vue';
import { decode_jwt } from '@shared/ts/helpers';
import ctrl from '@src/ts/ctrl_frame';

type PageName =
  | 'create_account_step_one'
  | 'create_account_step_two'
  | 'log_in'
  | 'reset_pass_step_one'
  | 'reset_pass_step_two'
  | 'reset_pass_step_three';

let model = reactive({
  //
  stage_name: 'log_in' as PageName,
  from_sate: null as 'reset_pass' | 'create_account' | null,
  //
  // email: "",
  // email_code: "",
  // pass: "",
  // pass2: "",
  //
  email: '',
  email_code: '',
  pass: '',
  pass2: '',
  //
  pass_type: 'password',
  pass_type2: 'password',
  errors: [] as string[],
  //
  continue_with_google_button: {
    text: 'Continue with Google',
    color: 'white',
    icon: local_google,
    invert_icon: false,
  },
  //
});

let methods = {
  close_error(text) {
    for (let i = model.errors.length; i--; ) {
      if (model.errors[i] === text) {
        model.errors.splice(i, 1);
        break;
      }
    }
  },
  clear_errors() {
    if (model.errors.length > 0) {
      model.errors = [];
    }
  },
  continue_with_google_button() {
    ctrl.auth.trigger_sign_in_with_google();
  },
  goto(page_name: PageName) {
    model.stage_name = page_name;
    model.errors = [];
    // ctrl.goto(page_name);
  },
  handle_click_eye_pass(field: string) {
    if (model[field] === 'password') {
      model[field] = 'text';
    } else {
      model[field] = 'password';
    }
  },
};
async function log_in() {
  const email_ = model.email;
  const pass_ = model.pass;

  if (!email_.length) {
    model.errors = ['Email can not be empty'];
    return;
  }

  if (!pass_.length) {
    model.errors = ['Password can not be empty'];
    return;
  }
  //
  ctrl.blocking_inc();
  //
  const log_in_response = await ctrl.proxy_backend.auth.log_in(email_, pass_);
  if (log_in_response.code === RESPONSE_CODE.SUCCESS) {
    ctrl.auth.handle_auth_success(log_in_response.jwt_token);
  } else {
    model.errors = ['Could not log in. Please try again.'];
  }
  ctrl.blocking_dec();
}
async function create_account_step_one() {
  const email_ = model.email;
  const pass_ = model.pass;
  const pass2_ = model.pass2;

  if (!email_.length) {
    model.errors = ['Email can not be empty'];
    return;
  }

  if (!pass_.length) {
    model.errors = ['Password can not be empty'];
    return;
  }

  if (!pass2_.length) {
    model.errors = ['Repeat password can not be empty'];
    return;
  }

  if (pass_ !== pass2_) {
    model.errors = ['Passwords are not equal'];
    return;
  }

  ctrl.blocking_inc();
  const create_user_step_one_response = await ctrl.proxy_backend.auth.create_account_step_one(email_);
  if (create_user_step_one_response.code === RESPONSE_CODE.SUCCESS) {
    methods.goto('create_account_step_two');
  } else {
    model.errors = ['User with this email already exist'];
  }
  ctrl.blocking_dec();
}
async function create_account_step_two() {
  const email_code = model.email_code;
  if (!email_code.length) {
    model.errors = ['Email code can not be empty'];
    return;
  }
  ctrl.blocking_inc();
  const response = await ctrl.proxy_backend.auth.create_account_step_two(email_code, model.email, model.pass);
  if (response.code === RESPONSE_CODE.SUCCESS) {
    ctrl.auth.handle_auth_success(response.jwt_token);
  } else if (response.code === RESPONSE_CODE.ERROR_ALREADY_EXISTS) {
    model.errors = ['User with this email already exists.'];
  } else {
    model.errors = ['Could not create user.'];
  }
  ctrl.blocking_dec();
}
async function reset_pass_step_one() {
  ctrl.blocking_inc();
  //
  const input_email = model.email;
  if (!input_email.length) {
    model.errors = ["Email can't be empty"];
    return;
  }
  const response = await ctrl.proxy_backend.auth.reset_pass_step_one(input_email);
  if (response.code === RESPONSE_CODE.SUCCESS) {
    methods.goto('reset_pass_step_two');
  } else {
    model.errors = ['User with this email doesn`t exist'];
  }
  //
  ctrl.blocking_dec();
}
async function reset_pass_step_two() {
  ctrl.blocking_inc();
  //
  const response = await ctrl.proxy_backend.auth.reset_pass_step_two(model.email_code, model.email);
  if (response.code === RESPONSE_CODE.SUCCESS) {
    methods.goto('reset_pass_step_three');
  }
  //
  ctrl.blocking_dec();
}
async function reset_pass_step_three() {
  const email_ = model.email;
  const pass_ = model.pass;
  const pass2_ = model.pass2;

  if (!email_.length) {
    model.errors = ['Email can not be empty'];
    return;
  }

  if (!pass_.length) {
    model.errors = ['Password can not be empty'];
    return;
  }

  if (!pass2_.length) {
    model.errors = ['Repeat password can not be empty'];
    return;
  }

  if (pass_ !== pass2_) {
    model.errors = ['Passwords are not equal'];
    return;
  }
  //
  ctrl.blocking_inc();
  //
  const response = await ctrl.proxy_backend.auth.reset_pass_step_three(model.email_code, model.email, model.pass);
  if (response.code === RESPONSE_CODE.SUCCESS) {
    ctrl.goto('page_native_auth_success');
    ctrl.store.auth = {
      jwt_token: response.jwt_token,
      jwt_claims: decode_jwt(response.jwt_token),
    };
  }
  //
  ctrl.blocking_dec();
}
</script>

<template>
  <div class="page page-auth">
    <!-- log_in -->
    <div class="form" v-if="model.stage_name === 'log_in'">
      <div class="form__title">Sign in</div>
      <div class="form__subtitle">
        GDPR nad CCPA Compliant. By clicking "Continue with Google" you agree to the Terms of Use and our Privacy Policy.
      </div>
      <div class="form__error" v-if="model.errors && model.errors.length > 0">
        <CardError v-on:my_close="methods.close_error" :text="error" v-for="error in model.errors" :key="error" :is_close="false" />
      </div>
      <div class="form__other">
        <Button v-on:button_click="methods.continue_with_google_button" :model="model.continue_with_google_button"></Button>
      </div>
    </div>
  </div>
</template>

<style></style>

<style>
.form {
  font-size: 14px;
}
.page.page-auth {
  flex-grow: 1;
  padding: 24px 48px;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin: 0 auto;
  background-color: white;
}

.page-auth .form {
  width: 100%;
  max-width: 420px;
}

.page-auth .button {
  min-width: 320px;
}

.page-auth .form .form__title {
  width: 100%;
  font-size: 24px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.8);
  margin: 0px 0px 12px 0px;
}

.page-auth .form .form__subtitle {
  width: 100%;
  font-size: 15px;
  line-height: 19px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.85);
  margin: 0px 0px 18px 0px;
}

.page-auth-header {
  display: flex;
  width: 100%;
  justify-content: center;
  margin: 0px 0px 16px 0px;
  color: var(--color-primary-black);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  /* 142.857% */
}

.page-auth-header__block {
  width: 100px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--color-divider-gray);
  cursor: pointer;
  transition: all 0.1s ease;
  user-select: none;
}

.page-auth-header__block.active {
  color: var(--color-primary-green);
  border-bottom-color: var(--color-primary-green);
  cursor: pointer;
}

.page-auth-form {
  max-width: 720px;
  width: 100%;
}

.page-auth-form {
  line-height: 22px;
}

.auth-card .form {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding-top: 60px;
  min-width: 440px;
  min-height: 540px;
}

.form__error {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  margin: 0px 0px 20px 0px;
}

.page-auth-cred {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.page-auth-cred__field {
  display: flex;
  flex-direction: column;
  margin: 0px 0px 12px 0px;
}

.page-auth-cred label {
  color: var(--color-secondary-gray);
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  margin: 0px 0px 5px 0px;
}

.page-auth-cred input {
  height: 36px;
  width: 100%;
  border-radius: 4px;
  color: var(--color-ttip-gray);
  border: 1px solid var(--color-divider-gray);
  padding: 10px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.page-auth-cred input::placeholder {
  color: rgba(0, 0, 0, 0.3);
  letter-spacing: 0.2px;
}

.page-auth-cred input:hover {
  border-color: var(--color-secondary-gray);
}

.page-auth-cred input:focus {
  outline: none;
  border-color: var(--color-secondary-gray);
}

.page-auth-pass {
  display: flex;
  position: relative;
}

.page-auth-pass input {
  padding-right: 40px;
}

.page-auth-pass__eye {
  position: absolute;
  right: 10px;
  transform: translate(0px, -50%);
  top: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  cursor: pointer;
}

.page-auth-pass__eye svg {
  width: 100%;
  height: 100%;
  fill: var(--color-secondary-gray);
}

.page-auth-other {
  display: flex;
  flex-direction: column;
  row-gap: 20px;
}

.action-text {
  cursor: pointer;
  color: #445da1;
}
</style>
