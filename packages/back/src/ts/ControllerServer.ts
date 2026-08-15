import ModuleAuth from "./ModuleAuth";
import ModuleProject from "./ModuleProject";
import ModuleStripe from "./ModuleStripe";
import ModuleCommon from "./ModuleCommon";
import ModuleTest from "./ModuleTest";
import config from "@shared/config";
import ModuleAdmin from "./ModuleAdmin";

// export
export default class ControllerServer {
  project: ModuleProject;
  auth: ModuleAuth;
  admin: ModuleAdmin;
  stripe: ModuleStripe;
  common: ModuleCommon;
  test: ModuleTest | null;
  constructor() {
    this.auth = new ModuleAuth();
    this.stripe = new ModuleStripe();
    this.project = new ModuleProject();
    this.common = new ModuleCommon();
    this.admin = new ModuleAdmin();
    // todo: enable the testing module only during development
    if (config.mode === "prod") {
      // this.test = null;
      this.test = new ModuleTest(this);
    } else {
      this.test = new ModuleTest(this);
    }
    // this.common.save_log("test", [], { test: Date.now() });
  }
}
