import config from '@shared/config';

export default class ModuleProjectContent {
  constructor() {}
  async init() {
    setInterval(() => {
      this.tick();
    }, 75);
    document.addEventListener('click', () => {
      let simple_json = this.body_to_simple_json(document.body);
      console.log('simple_json', simple_json);
    });
  }
  // Tick
  latest_text: string;
  async tick() {
    try {
      console.log('tick');
    } catch (e) {}
  }
  body_to_simple_json(body: HTMLElement) {
    //
    return { a: 1, b: 2 };
  }
}
