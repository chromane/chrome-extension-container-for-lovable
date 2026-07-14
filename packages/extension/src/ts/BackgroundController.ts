import ModuleProjectBackground from "./ModuleProjectBackground";

export default class BackgroundController {
  project: ModuleProjectBackground;
  constructor() {
    this.project = new ModuleProjectBackground();
  }
  async init() {
    this.project.init();
  }
}
