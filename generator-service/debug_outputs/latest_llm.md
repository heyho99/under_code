# 1問目
## title
オブジェクトからの値取得とフォールバック

## statement
<p><code>sysin</code> は <code>{"routes": object, "hash": string}</code> の形式です。次の処理を再現してください。</p>
<p><code>path</code> という変数に <code>hash</code> の値を代入します。ただし <code>hash</code> が空文字列の場合は、代わりに <code>"#/quiz-creation"</code> を代入します。その後、<code>routes</code> オブジェクトからキー <code>path</code> に対応する値を取り出し、<code>nextController</code> とします。もし <code>nextController</code> が <code>undefined</code> または <code>null</code> なら、処理を打ち切って <code>null</code> を出力してください。それ以外の場合は、<code>nextController</code> をそのまま出力してください。</p>

## sysinFormat
`{"routes": object, "hash": string}`

## sampleAnswer
```javascript
const fs = require("fs");
const sysin = JSON.parse(fs.readFileSync(0, "utf8"));

const path = sysin.hash || "#/quiz-creation";
const nextController = sysin.routes[path];

let result = null;
if (!nextController) {
  result = null;
} else {
  result = nextController;
}

process.stdout.write(JSON.stringify(result) + "\n");
```

## testcases
### testcase1
`{"sysin": {"routes": {"#/quiz-creation": {"name": "creator"}}, "hash": ""}, "expected": {"name": "creator"}}`
### testcase2
`{"sysin": {"routes": {"#/quiz-set-list": {"name": "list"}}, "hash": "#/quiz-set-list"}, "expected": {"name": "list"}}`
### testcase3
`{"sysin": {"routes": {"#/quiz-set-list": {"name": "list"}}, "hash": "#/unknown"}, "expected": null}`

# 2問目
## title
オブジェクトからの値取得とデフォルト値の利用

## statement
<p><code>sysin</code> は <code>{"path": string}</code> の形式です。次の処理を再現してください。</p>
<p><code>navMapping</code> というオブジェクトを、問題文中の対象コードと同じ内容（<code>"#/problem-list"</code> と <code>"#/quiz-play"</code> の2つのキーを持ち、それぞれが <code>"#/quiz-set-list"</code> を値に持つ）で定義します。その後、<code>targetPath</code> という変数に <code>navMapping[sysin.path]</code> の値を代入します。ただし、その値が <code>undefined</code> または存在しない場合は、代わりに <code>sysin.path</code> 自身を代入します。最終的に <code>targetPath</code> を出力してください。</p>

## sysinFormat
`{"path": string}`

## sampleAnswer
```javascript
const fs = require("fs");
const sysin = JSON.parse(fs.readFileSync(0, "utf8"));

const navMapping = {
  "#/problem-list": "#/quiz-set-list",
  "#/quiz-play": "#/quiz-set-list"
};

const targetPath = navMapping[sysin.path] || sysin.path;

const result = targetPath;

process.stdout.write(JSON.stringify(result) + "\n");
```

## testcases
### testcase1
`{"sysin": {"path": "#/problem-list"}, "expected": "#/quiz-set-list"}`
### testcase2
`{"sysin": {"path": "#/quiz-play"}, "expected": "#/quiz-set-list"}`
### testcase3
`{"sysin": {"path": "#/quiz-creation"}, "expected": "#/quiz-creation"}`

# 3問目
## title
条件分岐による関数呼び出し有無の判定

## statement
<p><code>sysin</code> は <code>{"current": any, "hasUnmount": boolean}</code> の形式です。次の処理を再現してください。</p>
<p><code>currentController</code> に <code>sysin.current</code> を代入します。もし <code>sysin.hasUnmount</code> が <code>true</code> なら、<code>currentController</code> に <code>unmount</code> というプロパティを持たせ、その値として何もしない関数（空の関数）を代入します。<code>sysin.hasUnmount</code> が <code>false</code> の場合は <code>unmount</code> プロパティは追加しません。</p>
<p>その後、<code>if (currentController && typeof currentController.unmount === "function") { currentController.unmount(); }</code> というロジックと同等の判定を行い、「<code>unmount</code> が実行されたかどうか」を真偽値で表し、<code>result</code> として出力してください。</p>

## sysinFormat
`{"current": any, "hasUnmount": boolean}`

## sampleAnswer
```javascript
const fs = require("fs");
const sysin = JSON.parse(fs.readFileSync(0, "utf8"));

let currentController = sysin.current;

if (sysin.hasUnmount && currentController && typeof currentController === "object") {
  currentController.unmount = function () {};
}

let called = false;

if (currentController && typeof currentController.unmount === "function") {
  currentController.unmount();
  called = true;
}

const result = called;

process.stdout.write(JSON.stringify(result) + "\n");
```

## testcases
### testcase1
`{"sysin": {"current": {}, "hasUnmount": true}, "expected": true}`
### testcase2
`{"sysin": {"current": {}, "hasUnmount": false}, "expected": false}`
### testcase3
`{"sysin": {"current": null, "hasUnmount": true}, "expected": false}`