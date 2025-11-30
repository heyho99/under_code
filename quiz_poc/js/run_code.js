document.getElementById('run-btn').addEventListener('click', async function() {
    const code = editor.getValue();
    const resultArea = document.getElementById('result-area');

    resultArea.innerHTML = "実行中...（数秒かかります）";

    try {
        const response = await fetch('/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                language: 'python3',
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
                     入力: ${res.input} / 期待値: ${res.expected} <br>
                     あなたの出力: ${res.output}</li>`;
        });
        html += '</ul>';

        resultArea.innerHTML = html;
    } catch (error) {
        resultArea.innerHTML = "<span class='fail'>通信エラーが発生しました</span>";
        console.error(error);
    }
});
