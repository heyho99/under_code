import { ProjectController } from "../features/project/ProjectController.js";
import { QuizDesignController } from "../features/quiz-design/QuizDesignController.js";
import { QuizProgressController } from "../features/quiz-progress/QuizProgressController.js";
import { LoginController } from "../features/login/LoginController.js";
import { SignupController } from "../features/signup/SignupController.js";
import { QuizListController } from "../features/quiz-list/QuizListController.js";
import { QuizSetDetailController } from "../features/quiz-set-detail/QuizSetDetailController.js";
import { QuizPlayController } from "../features/quiz-play/QuizPlayController.js";

export const routes = {
  "#/login": LoginController,
  "#/signup": SignupController,
  "#/project": ProjectController,
  "#/quiz-design": QuizDesignController,
  "#/dashboard": QuizProgressController,
  "#/quiz-list": QuizListController,
  "#/quiz-set-detail": QuizSetDetailController,
  "#/quiz-play": QuizPlayController,
};
