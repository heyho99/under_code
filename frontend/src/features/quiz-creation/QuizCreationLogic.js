const CHARS_PER_QUESTION = 500;

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
    return {
      fileName: file.name || `file-${index + 1}`,
      content: contents[index] || "",
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
      content: file.content,
      problemCounts: {
        syntax: syntaxCount,
      },
    };
  });
}
