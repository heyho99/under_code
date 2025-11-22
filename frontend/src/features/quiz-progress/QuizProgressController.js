import { QuizProgressView } from "./QuizProgressView.js";
import { updateHeader, activateSection } from "../../ui/MainHeader.js";

export const QuizProgressController = {
  mount() {
    const root = QuizProgressView.getRoot();
    QuizProgressView.render(root);
    updateHeader(QuizProgressView);
    activateSection(QuizProgressView.key);
  },
  unmount() {
    const root = QuizProgressView.getRoot();
    if (root) root.innerHTML = "";
  },
};
