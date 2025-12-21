const CHARS_PER_QUESTION = 1000;

const EXTENSION_TO_LANGUAGE = {
  ".py": "python3",
  ".js": "javascript",
  ".mjs": "javascript",
  ".cjs": "javascript",
  ".go": "go",
};

export function getLanguageFromFileName(fileName) {
  if (!fileName) return "python3";
  const lowerName = fileName.toLowerCase();
  for (const [ext, lang] of Object.entries(EXTENSION_TO_LANGUAGE)) {
    if (lowerName.endsWith(ext)) {
      return lang;
    }
  }
  return "python3";
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        resolve("");
      }
    };
    reader.onerror = () => {
      reject(reader.error || new Error("ファイルの読み込みに失敗しました。"));
    };
    reader.readAsText(file);
  });
}

export async function readFilesFromInput(fileList) {
  const files = Array.from(fileList || []);
  if (files.length === 0) {
    return [];
  }

  const contents = await Promise.all(files.map((file) => readFileAsText(file)));

  return files.map((file, index) => {
    const fileName = file.name || `file-${index + 1}`;
    return {
      fileName,
      content: contents[index] || "",
      detectedLanguage: getLanguageFromFileName(fileName),
    };
  });
}

export function calculateQuestionsFromContent(content) {
  if (!content) {
    return 0;
  }
  const length = content.length;
  if (length <= 0) {
    return 0;
  }
  const questions = Math.ceil(length / CHARS_PER_QUESTION);
  return questions < 1 ? 1 : questions;
}

export function calculateTotalQuestionsFromFiles(files) {
  if (!files || files.length === 0) {
    return 0;
  }
  return files.reduce((sum, file) => {
    return sum + calculateQuestionsFromContent(file.content);
  }, 0);
}

export function buildFilesForApi(uploadedFiles) {
  if (!uploadedFiles || uploadedFiles.length === 0) {
    return [];
  }

  return uploadedFiles.map((file) => {
    const syntaxCount = calculateQuestionsFromContent(file.content);
    return {
      fileName: file.fileName,
      defaultLanguage: file.detectedLanguage || "python3",
      content: file.content,
      problemCounts: {
        syntax: syntaxCount,
      },
    };
  });
}

export function detectDefaultLanguage(uploadedFiles) {
  if (!uploadedFiles || uploadedFiles.length === 0) {
    return "python3";
  }
  return uploadedFiles[0].detectedLanguage || "python3";
}
