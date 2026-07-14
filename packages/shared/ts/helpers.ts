export function is_string(obj) {
  return typeof obj === 'string';
}
export function is_number(obj) {
  return typeof obj === 'number';
}
export function is_nan(obj) {
  return typeof obj === 'number' && isNaN(obj);
}
export function is_undefined(value) {
  return typeof value === 'undefined';
}
export function is_null(obj) {
  return obj === null;
}
export function is_function(obj) {
  return typeof obj === 'function';
}
export function is_array(obj) {
  return Array.isArray(obj);
}
export function is_bool(obj) {
  return typeof obj === 'boolean';
}
export function is_simple_object(obj) {
  return Object.prototype === Object.getPrototypeOf(obj);
}

export async function wait(time: number) {
  return new Promise((resolve: Function) => {
    setTimeout(resolve, time);
  });
}

export function decode_jwt(token: string) {
  try {
    if (token) {
      // @ts-ignore
      return JSON.parse(atob(token.split('.')[1]));
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
}

export function encode_jwt(...parts: Array<any>) {
  let jwt = [];
  for (let part of parts) {
    // @ts-ignore
    jwt.push(btoa(encode_json(part)));
  }
  return jwt.join('.');
}

export function encode_url_state(json: any) {
  return encodeURIComponent(btoa(encode_json(json)));
}

export function decode_url_state(state: string) {
  return decode_json(atob(decodeURIComponent(state)));
}

// AJAX Overrides
export type OverrideDataXHR = {
  name: string;
  data: {
    status: number;
    response_text: string;
    request_url: string | URL;
    response_url: string;
    request_headers: any;
    response_headers?: any;
  };
};

export type OverrideDataFetch = {
  name: string;
  data: {
    status: number;
    response_text: string;
    response_url: string;
    request_url: string | URL;
    request_text: string;
    response_headers: any;
    response_body: any;
  };
};

export function override_xhr(window: Window, callback: (message: OverrideDataXHR) => void) {
  var _open = XMLHttpRequest.prototype.open;
  var _setRequestHeader = (window['XMLHttpRequest'] as typeof XMLHttpRequest).prototype.setRequestHeader;

  (window['XMLHttpRequest'] as typeof XMLHttpRequest).prototype.setRequestHeader = function (name: string, value: string) {
    if (!this['chromane_request_headers']) {
      this['chromane_request_headers'] = {};
    }

    this['chromane_request_headers'][name] = value;

    return _setRequestHeader.apply(this, arguments as any);
  };

  (window['XMLHttpRequest'] as typeof XMLHttpRequest).prototype.open = function (_method: string, request_url: string | URL) {
    this.addEventListener('load', (_event) => {
      if ((this.readyState === 4 && this.status === 200 && this.responseType === 'text') || this.responseType === '') {
        const message: OverrideDataXHR = {
          name: 'xhr_response_captured',
          data: {
            status: this.status,
            response_text: this.responseText,

            request_url: request_url,
            response_url: this.responseURL,

            request_headers: this['chromane_request_headers'],
            // response_headers: this.getAllresponseHeaders(),
          },
        };
        callback(message);
      }
      if (this.responseType === 'blob') {
        const blob = this.response as Blob;
        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>): void => {
          const response = event.target?.result as string;
          const message: OverrideDataXHR = {
            name: 'xhr_response_captured',
            data: {
              status: this.status,
              response_text: response,

              request_url: request_url,
              response_url: this.responseURL,

              request_headers: this['chromane_request_headers'],
            },
          };
          callback(message);
        };
        reader.readAsText(blob);
      }
    });

    return _open.apply(this, arguments as any);
  };
}

export function override_fetch(window: Window, callback: (message: OverrideDataFetch) => void) {
  var _fetch = window.fetch;

  window.fetch = async function (_request_url: RequestInfo | URL, _options: RequestInit | undefined) {
    var request, url;
    if (arguments[0] instanceof Request) {
      request = arguments[0];
      url = request.url;
    } else {
      request = arguments[1];
      url = arguments[0];
    }

    var request_text;
    if (request instanceof Request) {
      var request_clone = request.clone();
      request_text = await request_clone.text();
    } else {
      request_text = '';
    }

    var response = await _fetch.apply(window, arguments as any);
    var response_clone = response.clone();
    var response_text = await response_clone.text();

    var message: OverrideDataFetch = {
      name: 'fetch_response_captured',
      data: {
        status: response_clone.status,
        response_text: response_text,
        response_url: url,

        request_url: url,
        request_text,
        // request_options: options,
        response_headers: {},
        response_body: {},
      },
    };

    if (arguments[1] && arguments[1].headers) {
      if (arguments[1].headers instanceof Headers) {
        message.data.response_headers = {};

        for (var pair of arguments[1].headers.entries()) {
          message.data.response_headers[pair[0]] = pair[1];
        }
      } else {
        message.data.response_headers = arguments[1].headers;
      }
    }

    if (arguments[1] && arguments[1].body) {
      message.data.response_body = arguments[1].body;
    }

    callback(message);

    return response;
  };
}

export function decode_json<T>(text: string | null): T | null {
  if (text === null) return null;
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    return null;
  }
}

export function encode_json(json: object): string {
  return JSON.stringify(json);
}

export const json_encode = encode_json;
export const json_decode = decode_json;

export function html_entity_decode(text: string) {
  var entities = [
    ['amp', '&'],
    ['apos', "'"],
    ['#x27', "'"],
    ['#x2F', '/'],
    ['#39', "'"],
    ['#47', '/'],
    ['lt', '<'],
    ['gt', '>'],
    ['nbsp', ' '],
    ['quot', '"'],
  ];

  for (var i = 0, max = entities.length; i < max; ++i) {
    // @ts-ignore
    text = text.replace(new RegExp('&' + entities[i][0] + ';', 'g'), entities[i][1]);
  }

  return text;
}

export function get_google_auth_url(google_cloud_oauth_client_id, redirect_uri, scopes, state_obj) {
  let url_root = `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount`;
  // state will be passed to the chrome-extnesion/id/redirect page
  let state = btoa(encode_json(state_obj));
  // [ name, value ] pairs
  let params = [
    ['access_type', 'offline'],
    ['prompt', 'select_account'],
    ['include_granted_scopes', 'false'],
    ['response_type', 'code'],
    ['service', 'lso'],
    ['o2v', '2'],
    ['theme', 'glif'],
    ['flowName', 'GeneralOAuthFlow'],
    ['client_id', google_cloud_oauth_client_id],
    ['redirect_uri', redirect_uri],
    ['state', state],
    ['scope', scopes.join(' ')],
  ];
  let param_str = params
    .map(([name, value]) => {
      return `${name}=${encodeURIComponent(value)}`;
    })
    .join('&');
  //
  let auth_page_url = `${url_root}?${param_str}`;
  return auth_page_url;
}
export function obj_to_param_str(obj) {
  let items = [];
  for (let key in obj) {
    // @ts-ignore
    items.push(`${key}=${encodeURIComponent(obj[key])}`);
  }
  return items.join('&');
}

export function get_id() {
  return Date.now().toString(36) + Math.floor(Math.random() * 1_000_000_000_000).toString(36);
}

export function get_code() {
  return Math.floor(1_000_000_000 + Math.random() * 1_000_000_000_000)
    .toString(36)
    .slice(0, 6)
    .toUpperCase();
}

export function url_to_params(url: string) {
  let params: any = {};
  try {
    let str: any = url.split('?')[1];
    let split_1: any = str.split('&');
    for (let item of split_1) {
      let split_2 = item.split('=');
      let name = decodeURIComponent(split_2[0]);
      let value = decodeURIComponent(split_2[1]);
      params[name] = value;
    }
    return params;
  } catch (e) {
    return params;
  }
}

export function compare(obj_1, obj_2) {
  if (obj_1 === obj_2) {
    return true;
  } else if (obj_1 instanceof Date && obj_2 instanceof Date) {
    return obj_1.getTime() === obj_2.getTime();
  } else if (obj_1 === null && obj_2 === null) {
    return true;
  } else if (typeof obj_1 === 'object' && typeof obj_2 === 'object' && obj_1 !== null && obj_2 !== null) {
    var key_arr_1 = Object.keys(obj_1);
    var key_arr_2 = Object.keys(obj_2);
    var equal;

    for (var i = key_arr_1.length; i--; ) {
      // @ts-ignore
      equal = compare(obj_1[key_arr_1[i]], obj_2[key_arr_1[i]]);

      if (equal === false) {
        return false;
      }
    }

    for (var i = key_arr_2.length; i--; ) {
      // @ts-ignore
      equal = compare(obj_1[key_arr_2[i]], obj_2[key_arr_2[i]]);

      if (equal === false) {
        return false;
      }
    }

    return true;
  } else {
    return false;
  }
}

export function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function html_to_doc(html) {
  let parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

export function clone<T>(obj: T): T | null {
  try {
    return JSON.parse(JSON.stringify(obj)) as T;
  } catch (e) {
    return null;
  }
}

export function find_objects_with_props(root_obj: any, props_arr: Array<string>) {
  let result_arr: Array<any> = [];
  let object_arr = [root_obj];
  loop_1: for (let i = 0; i < object_arr.length; i++) {
    let current_obj = object_arr[i];
    if (
      //
      is_null(current_obj) === false &&
      (is_simple_object(current_obj) || is_array(current_obj)) === true
    ) {
      // Check if the current object has all the required properties
      // that we are looking for
      let all_props_found = true;
      loop_2: for (let prop of props_arr) {
        if (current_obj.hasOwnProperty(prop) === false) {
          all_props_found = false;
          break loop_2;
        }
      }
      if (all_props_found) {
        result_arr.push(current_obj);
      } else {
        // If this object is not what we are looking for -
        // Add all of it's children for futher review
        for (let key in current_obj) {
          object_arr.push(current_obj[key]);
        }
      }
    }
  }
  return result_arr;
}
export function find_objects_with_values(root_obj: any, values_arr: Array<Array<any>>) {
  let result_arr: Array<any> = [];
  let object_arr = [root_obj];
  loop_1: for (let i = 0; i < object_arr.length; i++) {
    let current_obj = object_arr[i];
    if (
      //
      is_null(current_obj) === false &&
      (is_simple_object(current_obj) || is_array(current_obj)) === true
    ) {
      // Check if the current object has all the required properties
      // that we are looking for
      let all_props_found = true;
      loop_2: for (let [prop, value] of values_arr) {
        if (current_obj[prop] !== value) {
          all_props_found = false;
          break loop_2;
        }
      }
      if (all_props_found) {
        result_arr.push(current_obj);
      } else {
        // If this object is not what we are looking for -
        // Add all of it's children for futher review
        for (let key in current_obj) {
          object_arr.push(current_obj[key]);
        }
      }
    }
  }
  return result_arr;
}

export function arr_last(arr: Array<any>) {
  return arr[arr.length - 1];
}

export async function wait_for_element<T extends HTMLElement>(selector: string, time?: number): Promise<T | null> {
  if (is_undefined(time)) {
    time = 9_000;
  }
  for (let i = 0; i < time / 100; i++) {
    let element = document.querySelector<T>(selector);
    if (element) {
      return element;
    } else {
      await wait(100);
    }
  }
  return null;
}

export async function wait_for_elements<T extends HTMLElement>(selector: string, max_time = 1_000) {
  for (let i = 0; i < max_time; i++) {
    let elements = document.querySelectorAll<T>(selector);
    if (elements && elements.length) {
      return elements;
    } else {
      await wait(100);
    }
  }
  return [] as T[];
}

export function find_element_by_text(selector: string, text: string) {
  let elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
  let target_text = text.trim().toLowerCase();
  for (let element of elements) {
    if (element.textContent?.trim().toLowerCase() === target_text) {
      return element;
    }
  }
  return null;
}

export function get_methods(obj: object) {
  return Object.getOwnPropertyNames(obj).filter((item) => {
    try {
      return typeof obj[item] === 'function';
    } catch (e) {
      return false;
    }
  });
}

// convert milliseconds to days
// will always return 0 if ms < 0
export function ms_to_days(ms: number) {
  if (ms < 0) {
    return 0;
  } else {
    let ms_in_one_day = 1000 * 60 * 60 * 24;
    return Math.ceil(ms / ms_in_one_day);
  }
}

export function days_to_ms(days) {
  let ms_in_one_day = 1000 * 60 * 60 * 24;
  return days * ms_in_one_day;
}

export function download_string(str: BlobPart, name: string) {
  const blob = new Blob([str], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  document.body.appendChild(a);
  a.setAttribute('style', 'display: none');
  a.href = url;
  a.download = name;
  a.click();

  window.URL.revokeObjectURL(url);
}

export function download_blob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.setAttribute('style', 'display: none');
  a.href = url;
  a.download = name;
  a.click();
  window.URL.revokeObjectURL(url);
}

// generates a SHA-256 hash from a string
export async function hash_str(string: string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function get_element_data(
  //
  root_element,
  selector: string,
  value_type: string,
  detail?,
  modifiers?: Array<Array<string>>
) {
  try {
    var output: any = null;
    var doc = root_element;
    // if (frame === "main") {
    //   doc = document;
    // } else {
    //   doc = document.querySelector(frame).contentDocument;
    // }
    if (value_type === 'exists') {
      let element = doc.querySelector(selector);
      if (element === null) {
        output = false;
      } else {
        output = true;
      }
    } else if (value_type === 'length') {
      output = doc.querySelectorAll(selector).length;
    } else {
      let element;
      if (selector === 'self') {
        element = root_element;
      } else {
        element = doc.querySelector(selector);
      }
      if (element) {
        if (value_type === 'text') {
          output = element.textContent;
        } else if (value_type === 'inner_text') {
          output = element.innerText;
        } else if (value_type === 'html_inner') {
          output = element.innerHTML;
        } else if (value_type === 'html_outer') {
          output = element.outerHTML;
        } else if (value_type === 'attr') {
          output = element.getAttribute(detail);
        } else if (value_type === 'property') {
          output = element[detail];
        } else if (value_type === 'value') {
          output = element.value;
        } else {
          output = null;
        }
      } else {
        output = null;
      }
    }
    if (modifiers) {
      for (let modifier of modifiers) {
        let [modifier_name, detail_1, detail_2] = modifier;
        if (modifier_name === 'trim') {
          if (typeof output === 'string' && output.trim) {
            output = output.trim();
          }
        } else if (modifier_name === 'bool') {
          output = !!output;
        } else if (modifier_name === 'match' && output && output.match) {
          output = output.match(detail_1);
        } else if (modifier_name === 'array_item' && output) {
          // @ts-ignore
          output = output[detail_1];
        } else if (modifier_name === 'replace' && output && output.replace) {
          output = output.replace(detail_1, detail_2);
        }
      }
    }
    return output;
  } catch (error) {
    // console.log("error", error);
    return null;
  }
}

export function write_store_change(key, v_new, v_old) {
  let log_color = '#6d6ded';
  console.groupCollapsed(`%c store.${key}`, `color: ${log_color}`);
  console.log('old:', v_old);
  console.log('new:', v_new);
  console.groupEnd();
}

/**
 * Returns a new array with elements of the original array
 * in random order
 * @param unshuffled
 * @returns
 */
export function randomize_arr(unshuffled) {
  let shuffled = unshuffled
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
  return shuffled;
}

export async function get_mock_page_data() {
  let element = await wait_for_element('pre#json');
  if (element) {
    return decode_json<any>(element.innerHTML);
  } else {
    return null;
  }
}

export function simulate_input_event(box, text) {
  var beforeInputEvent = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    data: text,
    inputType: 'insertText',
  });
  box.dispatchEvent(beforeInputEvent);
}

export function simulate_paste_event(box, text) {
  var dt = new DataTransfer();
  dt.setData('text/plain', text);
  var e = new ClipboardEvent('paste', {
    clipboardData: dt,
    bubbles: true,
  });
  box.dispatchEvent(e);
}

export function html_to_element(html: string) {
  let div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild as HTMLElement;
}

export const collapse_keys = (obj) => {
  var collapsed_obj = {};

  Object.keys(obj).forEach((key) => {
    if (key === 'display_comments') {
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      collapsed_obj[key] = obj[key];

      var sub_obj = collapse_keys(obj[key]);

      Object.keys(sub_obj).forEach((sub_obj_key) => {
        collapsed_obj[key + '.' + sub_obj_key] = sub_obj[sub_obj_key];
      });
    } else {
      collapsed_obj[key] = obj[key];
    }
  });

  return collapsed_obj;
};

export function normalize_key(str: string) {
  str = str || '';
  return str
    .trim()
    .toLowerCase()
    .replaceAll(/[^0-9a-z]/g, '_')
    .replaceAll(/_+/g, '_')
    .replaceAll(/_$/g, '')
    .replaceAll(/^_/g, '');
}

export function arr_get_random_item(arr: Array<any>) {
  let index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

export function arr_remove_items(arr: Array<any>, key: string, value: any) {
  for (let i = arr.length; i--; ) {
    if (arr[i][key] === value) {
      arr.splice(i, 1);
    }
  }
  return arr;
}

export async function file_to_base64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}
export function input_set_value_react(input, value) {
  // @ts-ignore
  var nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  // @ts-ignore
  nativeTextAreaValueSetter.call(input, value);
  var event = new Event('input', { bubbles: true });
  input.dispatchEvent(event);
}
export function textarea_set_value_react(input, value) {
  // @ts-ignore
  var nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  // @ts-ignore
  nativeTextAreaValueSetter.call(input, value);
  var event = new Event('input', { bubbles: true });
  input.dispatchEvent(event);
}

export function stop_propagation_smart(e: any) {
  e.stopPropagation();
  if (document.body) {
    document.body.dispatchEvent(new Event('click', { bubbles: true }));
  }
}

export async function contenteditable_type(element, text) {
  let contenteditable = element;
  // let letters = text.split(' ');
  let letters = [text];
  for (let i = 0; i < letters.length; i++) {
    var dt = new DataTransfer();
    dt.setData('text/plain', letters[i]);
    console.log(letters[i]);
    const e = new ClipboardEvent('paste', {
      clipboardData: dt,
      bubbles: true,
    });
    contenteditable.dispatchEvent(e);
    await wait(1);
    let event2 = new Event('input', { bubbles: true });
    contenteditable.dispatchEvent(event2);
    await wait(1);
    let event3 = new Event('change', { bubbles: true });
    contenteditable.dispatchEvent(event3);
    await wait(5 + Math.random() * 5);
  }
}

export function get_log_ts_prefix(ts: number) {
  let date = new Date(ts);
  let ts_start_hour = date.getHours();
  let ts_start_minute = date.getMinutes();
  let ts_start_second = date.getSeconds();
  let log_ts_prefix = `${pad(ts_start_hour)}:${pad(ts_start_minute)}:${pad(ts_start_second)}`;
  return log_ts_prefix;
}

export async function wait_for_element_by_text(selector, text, timeout?) {
  const time_interval = 100;

  if (!timeout) {
    timeout = 9_000;
  }

  let number_of_intervals = timeout / time_interval;

  for (let i = 0; i < number_of_intervals; i++) {
    let elements = Array.from(document.querySelectorAll(selector));

    for (let element of elements) {
      if (element) {
        if (element.textContent.trim().toLowerCase().includes(text.trim().toLowerCase())) {
          return element;
        }
      }
    }

    await wait(time_interval);
  }

  return null;
}
export async function wait_for_element_by_text_exact(selector, text, timeout?) {
  const time_interval = 100;

  let number_of_intervals = timeout / time_interval;

  for (let i = 0; i < number_of_intervals; i++) {
    let elements = Array.from(document.querySelectorAll(selector));

    for (let element of elements) {
      if (element) {
        if (element.textContent.trim().toLowerCase() === text.trim().toLowerCase()) {
          return element;
        }
      }
    }

    await wait(time_interval);
  }

  return null;
}

export function blob_to_base64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function wait_for_dom_content_loaded() {
  return new Promise((resolve) => {
    console.log('document.readyState', document.readyState);
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      resolve(true);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        resolve(true);
      });
    }
  });
}
