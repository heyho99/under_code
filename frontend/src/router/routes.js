import { ProjectController } from "../features/project/ProjectController.js";
import { QuizDesignController } from "../features/quiz-design/QuizDesignController.js";
import { QuizProgressController } from "../features/quiz-progress/QuizProgressController.js";
import { QuizListController } from "../features/quiz-list/QuizListController.js";
import { QuizSetDetailController } from "../features/quiz-set-detail/QuizSetDetailController.js";
import { QuizPlayController } from "../features/quiz-play/QuizPlayController.js";

export const routes = {
  "#/project": ProjectController,
  "#/quiz-design": QuizDesignController,
  "#/quiz-progress": QuizProgressController,
  "#/quiz-list": QuizListController,
  "#/quiz-set-detail": QuizSetDetailController,
  "#/quiz-play": QuizPlayController,
};
