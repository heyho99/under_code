import { QuizDesignView } from "./QuizDesignView.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";

export const QuizDesignController = {
  mount() {
    const root = QuizDesignView.getRoot();
    QuizDesignView.render(root);
    updateHeader(QuizDesignView);
    activateSection(QuizDesignView.key);
  },
  unmount() {
    const root = QuizDesignView.getRoot();
    if (root) root.innerHTML = "";
  },
};
