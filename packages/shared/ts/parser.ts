let _month_texts = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
import { decode_json, get_id, html_to_doc, html_to_element, is_nan, is_null, pad } from '@shared/ts/helpers';

export function pretty_time(ts: number) {
  let d = new Date(ts);
  let year = d.getFullYear();
  let month = d.getMonth();
  let month_text = _month_texts[month];
  let date = d.getDate();
  let hours = pad(d.getHours());
  let minutes = pad(d.getMinutes());
  return `${month_text} ${date}, ${year}, ${hours}:${minutes}`;
}
