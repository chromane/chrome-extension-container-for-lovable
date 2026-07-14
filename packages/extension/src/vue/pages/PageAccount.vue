<script setup lang="ts">
import Button from '@src/vue/comp/Button.vue';
import NameValues from '@src/vue/comp/NameValues.vue';
import { reactive } from 'vue';
import mdi_account_remove from '@mdi/svg/svg/account-remove.svg?raw';
import { watch } from 'vue';
import ctrl from '@src/ts/ctrl_frame';
import { RESPONSE_CODE, UserTag } from '@shared/types/common';
import ctrl_frame from '@src/ts/ctrl_frame';
import config from '@shared/config';

let model = reactive({
  nvm: {},
});

watch(
  () => ctrl.store.auth,
  () => {
    if (ctrl.store.auth && ctrl.store.auth.jwt_claims) {
      model.nvm = {
        Email: ctrl.store.auth.jwt_claims.email,
        Unlocked: ctrl.store.auth.jwt_claims.tags.includes('unlocked') ? 'true' : 'false',
        Roles: ctrl.store.auth.jwt_claims.roles.join(', '),
        Tags: ctrl.store.auth.jwt_claims.tags.join(', '),
      };
    }
  },
  { deep: true, immediate: true }
);

async function handle_click_upgrade() {
  ctrl.dialogs.open_dialog('upgrade', {});
}

async function handle_click_manage_sub() {
  // try {
  //   ctrl.blocking_inc();
  //   const r = await ctrl.proxy_backend.stripe.create_customer_portal_session(ctrl.store.auth!.jwt_token, ctrl.iframe_id);
  //   console.log('RESPONSE', r);
  //   if (r.code !== RESPONSE_CODE.SUCCESS) {
  //     throw r;
  //   }
  //   window.open(r.data.url, '__blank');
  //   ctrl.blocking_dec();
  // } catch (e: any) {
  //   ctrl.blocking_dec();
  //   // ctrl.handle_backend_error(e);
  // }
}

async function handle_click_delete_account() {
  let confirm = await ctrl_frame.dialogs.open_dialog('confirm', {
    title: 'Delete account',
    text: "Are you sure? This action can't be undone.",
    action_text: 'Delete',
  });

  if (confirm) {
    if (ctrl.store.auth.jwt_token) {
      ctrl.blocking_inc();
      let result = await ctrl.proxy_backend.auth.delete_user(ctrl.store.auth.jwt_token);
      if (result.code === RESPONSE_CODE.SUCCESS) {
        ctrl.auth.log_out();
        await ctrl.proxy_extension_iframe.storage_clear();
        ctrl.goto('auth');
        ctrl.toasts.show_toast({
          type: 'success',
          title: 'Account deleted',
          text: 'Your account and all data, associated with it has been deleted.',
        });
      } else {
        ctrl.toasts.show_toast({
          type: 'negative',
          title: 'Could not delete account',
          text: 'Something went wrong, please try again later.',
        });
      }
      ctrl.blocking_dec();
    }
  }
}

async function handle_click_testing_set_tags(tags: Array<UserTag>) {
  ctrl.blocking_inc();
  //
  let result = await ctrl.proxy_backend.test.testing_set_user_tags(ctrl.store.auth.jwt_token, tags);
  if (result.code === RESPONSE_CODE.SUCCESS) {
    await ctrl.auth.refresh_jwt_claims();
    ctrl.toasts.show_toast({
      type: 'success',
      title: 'User tags updated',
      text: `User tags have been updated to: ${tags.join(', ')}`,
    });
  }
  //
  ctrl.blocking_dec();
}
async function handle_click_testing_set_sent_messages(count: number) {
  ctrl.blocking_inc();
  //
  ctrl_frame.store.chrome_storage.count_sent_messages = count;
  ctrl.toasts.show_toast({
    type: 'success',
    title: 'Sent messages count updated',
    text: `Sent messages count has been updated to: ${count}`,
  });
  //
  ctrl.blocking_dec();
}
//
</script>

<template>
  <div class="page account">
    <div class="page-inner flex md:justify-center">
      <div class="w-full md:w-fit md:max-w-[800px]">
        <div class="section">
          <div class="title">My Account</div>
          <div class="text">In this section you can see information about your account and your usage statistics.</div>
          <NameValues v-if="ctrl.store.auth && ctrl.store.auth.jwt_claims" :model="model.nvm"></NameValues>
        </div>
        <div class="section">
          <div class="title">Delete Account</div>
          <div class="text">Use this section to delete your account and all information, associated with it from our servers.</div>
          <Button
            :model="{
              icon: mdi_account_remove,
              color: 'red',
              text: 'Delete account',
            }"
            v-on:button_click="handle_click_delete_account"
          >
          </Button>
        </div>
        <div class="section" v-if="config.mode === 'dev'">
          <div class="title">Testing</div>
          <div class="text">Use this section to test account roles and permissions.</div>
          <div class="flex flex-row flex-wrap gap-2">
            <Button
              :model="{
                text: 'set_tags | unlocked_all_features',
              }"
              v-on:button_click="handle_click_testing_set_tags(['unlocked', 'unlocked_all_features'])"
            >
            </Button>
            <Button
              :model="{
                text: 'set_tags | unlocked_email_finder_only',
              }"
              v-on:button_click="handle_click_testing_set_tags(['unlocked', 'unlocked_email_finder_only'])"
            >
            </Button>
            <Button
              :model="{
                text: 'set_sent_messages | 20',
              }"
              v-on:button_click="handle_click_testing_set_sent_messages(20)"
            >
            </Button>
            <Button
              :model="{
                text: 'set_sent_messages | 200',
              }"
              v-on:button_click="handle_click_testing_set_sent_messages(200)"
            >
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.page.account {
  .section-title {
    font-size: 20px;
    font-weight: 500;
    margin-bottom: 20px;
  }

  .section-text {
    margin-bottom: 10px;
    font-size: 16px;
  }

  .my-account-section {
    padding: 24px;
    max-width: 600px;
    background-color: #e3f2fd;
    color: #161616;
    border-radius: 4px;
    margin-bottom: 20px;
  }
  .my-account-section.red {
    background-color: #ffc7c7;
  }

  .section-button button {
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 16px;
    letter-spacing: inherit;
    font-family: inherit;
    color: #fafafa;
    font-weight: 500;
    min-width: 100px;
    margin: 10px 0;
  }

  .section-button--danger button {
    background-color: #f44336;
  }

  .section-button--primary button {
    background-color: #1e88e5;
  }
}
</style>
