<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import mdi_search from '@mdi/svg/svg/magnify.svg?raw';
import { wait } from '@shared/ts/helpers';
import console_log from '@shared/ts/console_log';

const model: any = defineModel<any>();
let ref_search_input = ref(null) as any;

const emits = defineEmits<{
  (e: 'on_select_change', data: any): void;
}>();

let model_local = reactive({
  //
  value: '',
  placeholder: 'Select tag',
  active: false,
  results_available_flag: true,
  tag_already_exists_flag: false,
  results_available_number: 0,
  //
  search_query: '',
  number_of_results: 1,
  selected_option_label: '',
  //
});

onMounted(() => {
  document.addEventListener('click', () => {
    console_log('document_click');
    model_local.active = false;
    methods.set_value();
  });
  methods.set_value();
});

watch(
  () => model.value.selected_value,
  () => {
    console.log('change', model.value.selected_value);
    update_selected_option_label();
  }
);

let methods = {
  set_value() {
    // if (props.active_option) {
    //   model_local.value = props.active_option.text;
    // } else {
    //   model_local.value = "";
    // }
  },
  // methods
  select_tag: async function ({ tag }) {
    emits('on_select_change', tag);
    model_local.active = false;
  },

  // internal

  filter_options: function () {
    // let value = model_local.value.toLowerCase();
    // let option_data: any = null;
    let results_available_flag = false;
    let tag_already_exists_flag = false;
    let results_available_number = 0;

    // for (var i = 0; i < props.options.length; i++) {
    //   option_data = props.options[i];
    //   if (option_data.text.toLowerCase() === value) {
    //     tag_already_exists_flag = true;
    //   }
    //   if (option_data.text.toLowerCase().indexOf(value) === -1) {
    //     option_data.visible = false;
    //   } else {
    //     option_data.visible = true;
    //     results_available_flag = true;
    //     results_available_number += 1;
    //   }
    // }

    model_local.tag_already_exists_flag = tag_already_exists_flag;
    model_local.results_available_number = results_available_number;
    model_local.results_available_flag = results_available_flag;
  },

  unfocus: function () {
    model_local.active = false;
    methods.set_value();
  },

  // event handlers

  chromane_select_input: function () {
    model_local.value = model_local.value.toLowerCase().replace(/[^a-z0-9]/g, '-');
    methods.filter_options();
  },

  chromane_select_click: function (event) {
    model_local.value = '';
    model_local.active = true;
    methods.filter_options();
    event.stopPropagation();
  },

  keypress: function (event) {
    //
    // if (event.keyCode === 13) {
    //   if (this.create_tags_flag && this.value && this.results_available_flag === false) {
    //     this.active = false;
    //     this.add_tag(first_tag);
    //   } else if (this.results_available_flag) {
    //     this.selected_tag(first_tag);
    //   }
    // }
  },
};

// handlers
async function handle_main_click() {
  model_local.active = !model_local.active;
  if (model_local.active) {
    await wait(1);
    ref_search_input.value.focus();
  }
}

function handle_search_query() {
  let search_query = model_local.search_query.trim().toLowerCase();
  console_log('handle_search_query', search_query);
  if (search_query === '') {
    model_local.number_of_results = 1;
    for (let section of model.value.sections) {
      section.visible = true;
      for (let option of section.options) {
        if (option.visible_by_default) {
          option.visible = true;
        } else {
          option.visible = false;
        }
      }
    }
  } else {
    let number_of_results = 0;
    for (let section of model.value.sections) {
      // console_log('section', section);
      let number_of_results_in_section = 0;
      for (let option of section.options) {
        // console_log('option', option);
        if (option.label.toLowerCase().includes(search_query)) {
          number_of_results_in_section += 1;
          number_of_results += 1;
          option.visible = true;
        } else {
          option.visible = false;
        }
      }
      if (number_of_results_in_section === 0) {
        section.visible = false;
      } else {
        section.visible = true;
      }
    }
    model_local.number_of_results = number_of_results;
  }
}

function handle_option_click(option, $event) {
  $event.stopPropagation();
  model.value.selected_value = option.value;
  model_local.active = false;
  update_selected_option_label();
}

function update_selected_option_label() {
  if (model.value.sections) {
    for (let section of model.value.sections) {
      for (let option of section.options) {
        if (model.value.selected_value === option.value) {
          model_local.selected_option_label = option.label;
        }
      }
    }
  }
}

async function handle_blur() {
  // todo: improve this logic
  await wait(101);
  model_local.active = false;
}

onMounted(() => {
  // console.log("mounted", model.value.sections);
  update_selected_option_label();
});
</script>

<template>
  <div class="chromane-select" v-on:click="methods.chromane_select_click" v-bind:class="{ active: model_local.active }">
    <div v-on:click="handle_main_click" class="main flex-center">
      <span v-text="model_local.selected_option_label"></span>
      <svg viewBox="0 0 24 24" class="chromane-select-chevron">
        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
      </svg>
    </div>
    <div class="dropdown">
      <div class="search">
        <div class="svg" v-html="mdi_search"></div>
        <input v-on:blur="handle_blur" v-model="model_local.search_query" v-on:input="handle_search_query" ref="ref_search_input" type="text" />
      </div>
      <div class="results" v-if="model && model.sections">
        <div v-for="section in model.sections" class="section" :class="{ visible: section.visible }">
          <div class="section-title" v-text="section.title"></div>
          <div
            class="option flex-center"
            v-for="option in section.options"
            :key="option.value"
            :class="{ visible: option.visible }"
            v-on:click="handle_option_click(option, $event)"
          >
            <span v-text="option.label"></span>
          </div>
        </div>
        <div class="empty flex-center" v-if="model_local.number_of_results === 0">No results found</div>
      </div>
    </div>
  </div>
</template>

<style>
.chromane-select {
  .main {
    justify-content: flex-start;
    border: 1px solid rgba(0, 0, 0, 0.12);
    background-color: white;
    border-radius: 4px;
    height: 36px;
    padding: 4px 4px 4px 12px;
    width: 100%;
    font-size: 13px;
  }
  .dropdown {
    position: relative;
    display: none;
    flex-direction: column;
    overflow: auto;
    z-index: 100;

    top: -1px;
    left: 0px;
    max-height: 320px;
    width: 100%;

    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.12);

    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    .search {
      height: 32px;
      position: relative;
      .svg {
        position: absolute;
        left: 4px;
        top: 4px;
        height: 24px;
        pointer-events: none;
        svg {
          width: 20px;
          height: 20px;
          margin: 2px 0px 0px 2px;
          fill: rgba(0, 0, 0, 0.5);
        }
      }
      input {
        height: 32px;
        padding: 4px 4px 4px 32px;
        width: 100%;
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
        font-weight: 400;
      }
    }
    .section-title {
      padding: 4px 4px 4px 12px;
      text-transform: uppercase;
      font-size: 12px;
      font-weight: bold;
      color: rgba(0, 0, 0, 0.7);
    }
    .section {
      border-bottom: none;
      margin-bottom: 0px;
      padding-bottom: 0px;
      display: none;
      &.visible {
        display: block;
      }
    }
    .results {
      flex: auto;
      overflow: auto;
      width: 100%;
      padding: 8px 0px;
      .option {
        display: none;
        height: 32px;
        padding: 0px 0px 0px 24px;
        justify-content: flex-start;
        cursor: pointer;
        background-color: white;
        transition: all 0.2s ease;
        user-select: none;
        &:hover {
          background-color: rgb(216, 216, 216);
        }
        &.visible {
          display: flex;
        }
      }
      .empty {
        justify-content: flex-start;
        height: 32px;
        padding: 0px 0px 0px 24px;
        font-size: 13px;
        font-style: italic;
        color: rgba(0, 0, 0, 0.7);
      }
    }
  }
  &.active {
    .main {
      border-radius: 4px 4px 0px 0px;
    }
    .dropdown {
      display: flex;
    }
  }
}
</style>
