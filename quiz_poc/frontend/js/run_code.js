// 実行ボタン押したらコードを実行モジュールに渡して結果を取得するjs

// 実行ボタン: 実行結果のみ表示
function getEditorCode() {
	if (window.editorAdapter && typeof window.editorAdapter.getValue === 'function') {
		return window.editorAdapter.getValue();
	}
	if (typeof editor !== 'undefined' && editor && typeof editor.getValue === 'function') {
		return editor.getValue();
	}
	console.error('Editor adapter is not initialized');
	return '';
}

document.getElementById('exec-btn').addEventListener('click', async function() {
	const code = getEditorCode();
    const resultArea = document.getElementById('result-area');
    const quizIdInput = document.getElementById('quiz-id');
    const quizId = quizIdInput ? parseInt(quizIdInput.value, 10) : 1;

    resultArea.innerHTML = "実行中...（数秒かかります）";

    try {
        const response = await fetch('/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                language: 'python3',
                quiz_id: quizId,
            }),
        });

        if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }

        const data = await response.json();

        let html = "<h3>実行結果</h3>";
        if (data.error) {
            html += "<p class='fail'>エラー: " + data.error + "</p>";
        }
        if (data.stdout) {
            html += "<pre>" + data.stdout + "</pre>";
        }
        if (data.stderr) {
            html += "<p class='fail'>stderr:</p><pre>" + data.stderr + "</pre>";
        }

        if (!data.error && !data.stdout && !data.stderr) {
            html += "<p>出力はありませんでした。</p>";
        }

        resultArea.innerHTML = html;
    } catch (error) {
        resultArea.innerHTML = "<span class='fail'>通信エラーが発生しました</span>";
        console.error(error);
    }
});

// 提出ボタン: テストケースで判定まで実施
document.getElementById('submit-btn').addEventListener('click', async function() {
	const code = getEditorCode();
    const resultArea = document.getElementById('result-area');
    const quizIdInput = document.getElementById('quiz-id');
    const quizId = quizIdInput ? parseInt(quizIdInput.value, 10) : 1;

    resultArea.innerHTML = "提出中...（数秒かかります）";

    try {
        const response = await fetch('/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                language: 'python3',
                quiz_id: quizId,
            }),
        });

        if (!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }

        const data = await response.json();

        let html = '';
        if (data.all_passed) {
            html += "<h3 class='pass'>AC (全問正解)</h3>";
        } else {
            html += "<h3 class='fail'>WA (不正解)</h3>";
        }

        html += '<ul>';
        data.details.forEach((res, index) => {
            const status = res.passed
                ? "<span class='pass'>OK</span>"
                : "<span class='fail'>NG</span>";
            html += `<li>ケース ${index + 1}: ${status} <br>
                     sysin: ${res.sysin} / 期待値: ${res.expected} <br>
                     あなたの出力: ${res.output}</li>`;
        });
        html += '</ul>';

        resultArea.innerHTML = html;
    } catch (error) {
        resultArea.innerHTML = "<span class='fail'>通信エラーが発生しました</span>";
        console.error(error);
    }
});
