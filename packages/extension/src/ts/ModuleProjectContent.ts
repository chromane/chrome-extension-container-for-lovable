import config from '@shared/config';

export default class ModuleProjectContent {
  constructor() {}
  async init() {
    setInterval(() => {
      this.tick();
    }, 75);
  }
  // Tick
  latest_text: string;
  async tick() {
    try {
      console.log('tick');
    } catch (e) {}
  }
}
