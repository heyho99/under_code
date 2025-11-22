import { initRouter, navigate } from "./router/router.js";
import { setupNav, setupSidebarToggle } from "./ui/Sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  setupNav(navigate);
  setupSidebarToggle();
  initRouter({ defaultPath: "#/project" });
});
