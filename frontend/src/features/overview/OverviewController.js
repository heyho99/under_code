import { OverviewView } from "./OverviewView.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";

export const OverviewController = {
  mount() {
    const root = OverviewView.getRoot();
    OverviewView.render(root);
    updateHeader(OverviewView);
    activateSection(OverviewView.key);
  },
  unmount() {
    const root = OverviewView.getRoot();
    if (root) root.innerHTML = "";
  },
};
