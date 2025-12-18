# 1問目
## title
論理和とオブジェクトプロパティ参照による値の決定

## statement
<p><code>sysin</code> は文字列 <code>path</code> と、文字列キーから文字列値へのマッピングを表すオブジェクト <code>navMapping</code> を持つオブジェクトです。</p>
<p><code>const targetPath = navMapping[path] || path;</code> と同じ処理を行い、得られた <code>targetPath</code> を JSON として出力してください。</p>
<p>処理としては、<ul><li><code>navMapping</code> に <code>path</code> プロパティが存在し、その値が truthy であればその値を使う</li><li>それ以外の場合は <code>path</code> 自体を使う</li></ul>というロジックを実装してください。</p>

## sysinFormat
<code>{"path": string, "navMapping": object}</code>

## sampleAnswer
```javascript
const fs = require("fs");
const sysin = JSON.parse(fs.readFileSync(0, "utf8"));

const path = sysin.path;
const navMapping = sysin.navMapping;

const targetPath = navMapping[path] || path;

const result = targetPath;

process.stdout.write(JSON.stringify(result) + "\n");
```

## testcases
### testcase1
`{"sysin": {"path": "#/problem-list", "navMapping": {"#/problem-list": "#/quiz-set-list", "#/quiz-play": "#/quiz-set-list"}}, "expected": "#/quiz-set-list"}`
### testcase2
`{"sysin": {"path": "#/quiz-creation", "navMapping": {"#/problem-list": "#/quiz-set-list"}}, "expected": "#/quiz-creation"}`
### testcase3
`{"sysin": {"path": "#/quiz-play", "navMapping": {"#/quiz-play": ""}}, "expected": "#/quiz-play"}`

# 2問目
## title
論理和によるデフォルト値付きの文字列選択

## statement
<p><code>sysin</code> は文字列 <code>hash</code> を持つオブジェクトです。</p>
<p><code>const path = window.location.hash || "#/quiz-creation";</code> と同等のロジックを、<code>window.location.hash</code> の代わりに <code>sysin.hash</code> を用いて実装してください。</p>
<p>具体的には、<ul><li><code>sysin.hash</code> が truthy ならその値を</li><li>falsy なら <code>"#/quiz-creation"</code> を</li></ul>選び、その結果の文字列を JSON として出力してください。</p>

## sysinFormat
<code>{"hash": string}</code>

## sampleAnswer
```javascript
const fs = require("fs");
const sysin = JSON.parse(fs.readFileSync(0, "utf8"));

const path = sysin.hash || "#/quiz-creation";

const result = path;

process.stdout.write(JSON.stringify(result) + "\n");
```

## testcases
### testcase1
`{"sysin": {"hash": ""}, "expected": "#/quiz-creation"}`
### testcase2
`{"sysin": {"hash": "#/quiz-set-list"}, "expected": "#/quiz-set-list"}`
### testcase3
`{"sysin": {"hash": "#/quiz-play"}, "expected": "#/quiz-play"}`

# 3問目
## title
条件分岐による処理の分岐と値の決定

## statement
<p><code>sysin</code> は文字列 <code>currentHash</code> と文字列 <code>path</code> を持つオブジェクトです。</p>
<p><code>navigate</code> 関数中の以下のロジックと同等の処理を実装してください。</p>
<p><code>if (window.location.hash === path) {<br>  handleRouteChange();<br>} else {<br>  window.location.hash = path;<br>}</code></p>
<p>ただし、<code>handleRouteChange()</code> の代わりに文字列 <code>"HANDLE"</code> を結果とし、<code>window.location.hash = path;</code> の代わりに <code>path</code> の値を結果とするものとします。</p>
<p>具体的には、<ul><li><code>currentHash</code> と <code>path</code> が等しければ、結果は文字列 <code>"HANDLE"</code></li><li>等しくなければ、結果は <code>path</code> の値</li></ul>とし、その結果を JSON として出力してください。</p>

## sysinFormat
<code>{"currentHash": string, "path": string}</code>

## sampleAnswer
```javascript
const fs = require("fs");
const sysin = JSON.parse(fs.readFileSync(0, "utf8"));

let result = null;

if (sysin.currentHash === sysin.path) {
  result = "HANDLE";
} else {
  result = sysin.path;
}

process.stdout.write(JSON.stringify(result) + "\n");
```

## testcases
### testcase1
`{"sysin": {"currentHash": "#/quiz-play", "path": "#/quiz-play"}, "expected": "HANDLE"}`
### testcase2
`{"sysin": {"currentHash": "#/quiz-play", "path": "#/quiz-set-list"}, "expected": "#/quiz-set-list"}`
### testcase3
`{"sysin": {"currentHash": "", "path": "#/quiz-creation"}, "expected": "#/quiz-creation"}`