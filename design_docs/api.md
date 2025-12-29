## Admin仕様

- **Admin判定**
  - JWT の `userId` が `0` のユーザーを admin とみなす
  - admin ユーザーは User Service のDBに `id=0` で予約される（初期ユーザー）
- **BFFの挙動（GETのスコープ）**
  - 通常ユーザー:
    - `Authorization: Bearer <token>` を付与する
    - `userId` はトークンから取得し、BFF→各Service呼び出しで `userId` をクエリとして付与して「自分のデータ」に絞る
  - admin ユーザー:
    - `Authorization: Bearer <token>` を付与する
    - `userId` はトークンから取得するが、BFF→各ServiceのGET呼び出しでは **`userId` クエリを付与しない**
    - その結果、Quiz Service / Progress Service は **全件 / 全体集計** を返す（adminの「全件閲覧」）

## 画面、BFF API、Service API
 
- 命名規則：bffは `/api/v1/*` （フロントエンドから見たらただのAPIのため）
- 命名規則：API(JSON)は camelCase、DBカラムは snake_case
- 認証が必要なAPIは Authorization: Bearer <token> をヘッダに付与し、userId はトークンから取得する（Frontendからは送らない）
 
### /#/login, /#/signup

- POST `/api/v1/auth/signup`
    - **Frontend to BFF**

      ```json
      {
        "description": "サインアップリクエスト（フロント→BFF）",
        "request": "POST /api/v1/auth/signup",
        "header": "Content-Type: application/json",
        "body": {
          "username": "tech_taro",
          "email": "taro@example.com",
          "password": "Password123!"
        },
        "response": {
          "status": 201,
          "body": {
            "id": 101,
            "username": "tech_taro",
            "email": "taro@example.com",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          }
        }
      }
      ```

    - **BFF to Services**
        - 処理：サインアップ
        - サービス：[User Service]

        ```json
        {
          "description": "User Service へのユーザ登録リクエスト",
          "request": "POST /user/users",
          "header": "Content-Type: application/json",
          "body": {
            "username": "tech_taro",
            "email": "taro@example.com",
            "password": "Password123!"
          },
          "response": {
            "status": 201,
            "body": {
              "id": 101,
              "username": "tech_taro",
              "email": "taro@example.com",
              "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
          }
        }
        ```

- POST `/api/v1/auth/login`
    - **Frontend to BFF**

      ```json
      {
        "description": "ログインリクエスト（フロント→BFF）",
        "request": "POST /api/v1/auth/login",
        "header": "Content-Type: application/json",
        "body": {
          "email": "taro@example.com",
          "password": "Password123!"
        },
        "response": {
          "status": 200,
          "body": {
            "id": 101,
            "username": "tech_taro",
            "email": "taro@example.com",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          }
        }
      }
      ```

    - **BFF to Services**
        - 処理：ログイン
        - サービス：[User Service]

        ```json
        {
          "description": "User Service へのログイン認証リクエスト",
          "request": "POST /user/users/login",
          "header": "Content-Type: application/json",
          "body": {
            "email": "taro@example.com",
            "password": "Password123!"
          },
          "response": {
            "status": 200,
            "body": {
              "id": 101,
              "username": "tech_taro",
              "email": "taro@example.com",
              "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
          }
        }
        ```


### /#/dashboard

- GET `/api/v1/dashboard/summary`
    - **Frontend to BFF**

      ```json
      {
        "description": "ダッシュボードサマリ取得（フロント→BFF）",
        "request": "GET /api/v1/dashboard/summary",
        "header": "Authorization: Bearer <token>",
        "body": null,
        "response": {
          "status": 200,
          "body": {
            "totalProblems": 150,
            "attemptedProblems": 60,
            "solvedProblems": 45
          }
        }
      }
      ```

    - **BFF to Services**
        - 処理：クイズ総数と「取り組んだ問題数（ユニーク）」「正解した問題数（ユニーク）」
        - サービス：[Quiz Service, Progress Service]

        ```markdown
        1. 並列で以下を実行する
           a. Quiz Service から「ユーザが作成したクイズ全問題数」を取得
           b. Progress Service から「ユーザーのユニーク正解数」を取得
           c. Progress Service から「ユーザーのユニーク取り組み数」を取得
        2. 両方の結果をマージして { totalProblems, attemptedProblems, solvedProblems } を返す
        ```

        ```json
        {
          "description": "(a) Quiz Service から「ユーザが作成したクイズ全問題数」を取得",
          "request": "GET /quiz/quizzes/stats/count",
          "header": "",
          "body": null,
          "response": {
            "status": 200,
            "body": { "totalProblems": 150 }
          }
        }
        ```

        ```json
        {
          "description": "(b) Progress Service から「ユーザーのユニーク正解数」を取得",
          "request": "GET /progress/stats/unique-solved?userId=101",
          "header": "",
          "body": null,
          "response": {
            "status": 200,
            "body": { "completedProblems": 45 }
          }
        }
        ```

        ```json
        {
          "description": "(c) Progress Service から「ユーザーのユニーク取り組み数」を取得",
          "request": "GET /progress/stats/unique-attempted?userId=101",
          "header": "",
          "body": null,
          "response": {
            "status": 200,
            "body": { "attemptedProblems": 60 }
          }
        }
        ```

- GET `/api/v1/dashboard/categories`
    - **Frontend to BFF**

      ```json
      {
        "description": "カテゴリ毎の数と完了数取得（フロント→BFF）",
        "request": "GET /api/v1/dashboard/categories",
        "header": "Authorization: Bearer <token>",
        "body": null,
        "response": {
          "status": 200,
          "body": [
            { "category": "Frontend", "count": 50, "attempted": 30, "solved": 20, "attemptedRate": 60, "solvedRate": 40 },
            { "category": "Backend", "count": 80, "attempted": 40, "solved": 25, "attemptedRate": 50, "solvedRate": 31 }
          ]
        }
      }
      ```

    - **BFF to Services**
        - 処理：カテゴリ毎の数と「取り組み数」「正解数」
        - サービス：[Quiz Service, Progress Service]

        ```markdown
        1. Quiz Service から「カテゴリ別の全問題数」と「problemIdとcategoryの対応」を取得
        2. Progress Service へ problemId 一覧を渡して「取り組み済み」「解答済み（正解）」の problemId 一覧を取得
        3. category ごとに attempted/solved を集計し attemptedRate/solvedRate を計算して返す
        ```

        ```json
        {
          "description": "(a) Quiz Service から「ユーザが作成したカテゴリ別の全問題数」を取得",
          "request": "GET /quiz/quizzes/stats/categories",
          "header": "",
          "body": null,
          "response": {
            "status": 200,
            "body": [
              { "category": "Frontend", "count": 50 },
              { "category": "Backend", "count": 80 }
            ]
          }
        }
        ```

        ```json
        {
          "description": "(b) BFF が Quiz Service と Progress Service を突合して「ユーザーのカテゴリ別正解数」を算出",
          "request": "(内部処理)",
          "header": "",
          "body": null,
          "response": {
            "status": 200,
            "body": "BFF 内部で集計"
          }
        }
        ```

        - Quiz Service: カテゴリ別総問題数
          - `GET /quiz/quizzes/stats/categories?userId=101`
        - Quiz Service: problemId と category の一覧
          - `GET /quiz/problem-categories?userId=101`
        - Progress Service: 取り組み済み problemId 一覧（バッチ）
          - `GET /progress/attempted-problems?userId=101&problemIds=1,2,3`
        - Progress Service: 解答済み problemId 一覧（バッチ）
          - `GET /progress/solved-problems?userId=101&problemIds=1,2,3`

- GET `/api/v1/dashboard/languages`
    - **Frontend to BFF**

      ```json
      {
        "description": "言語別の取り組み数/正解数（ユニーク）取得（フロント→BFF）",
        "request": "GET /api/v1/dashboard/languages",
        "header": "Authorization: Bearer <token>",
        "body": null,
        "response": {
          "status": 200,
          "body": [
            { "language": "python3", "attempted": 12, "solved": 8 },
            { "language": "javascript", "attempted": 6, "solved": 2 }
          ]
        }
      }
      ```

    - **BFF to Services**
        - 処理：言語別のユニーク取り組み数・ユニーク正解数
        - サービス：[Progress Service]

        ```json
        {
          "description": "Progress Service から言語別のユニーク統計を取得",
          "request": "GET /progress/stats/languages?userId=101",
          "header": "",
          "body": null,
          "response": {
            "status": 200,
            "body": {
              "items": [
                { "language": "python3", "attempted": 12, "solved": 8 },
                { "language": "javascript", "attempted": 6, "solved": 2 }
              ]
            }
          }
        }
        ```

- GET `/api/v1/dashboard/activities`
    - **Frontend to BFF**

      ```json
      {
        "description": "指定期間の日毎取り組み数取得（フロント→BFF）",
        "request": "GET /api/v1/dashboard/activities?period=30",
        "header": "Authorization: Bearer <token>",
        "body": null,
        "response": {
          "status": 200,
          "body": [
            { "date": "2023-10-01", "submissionsCount": 3, "solvedCount": 2 },
            { "date": "2023-10-02", "submissionsCount": 0, "solvedCount": 0 }
          ]
        }
      }
      ```

    - **BFF to Services**
        - 処理：指定期間の日毎取り組み数
        - サービス：[Progress Service]

        ```markdown
        1. BFFがクエリパラメータから期間(period=7,30,all)を受け取る
        2. Progress Service の集計APIを呼び出し、日毎の「提出数」と「正解数」を取得する
        3. 提出/正解が無い日は0
        ```

        ```json
        {
          "description": "Progress Service から「日毎の提出数」と「正解数」を取得",
          "request": "GET /progress/activities?userId=101&period=30",
          "header": "",
          "body": null,
          "response": {
            "status": 200,
            "body": [
              { "date": "2023-10-01", "submissionsCount": 3, "solvedCount": 2 },
              { "date": "2023-10-02", "submissionsCount": 0, "solvedCount": 0 }
            ]
          }
        }
        ```

### /#/quiz-creation

- POST `/api/v1/quiz-creation/generate`
    - **Frontend to BFF**

      - files は複数指定でき、各ファイルは `defaultLanguage` を持つ（Paiza.io の language 値に準拠）
      - リクエストボディ直下の `defaultLanguage` は後方互換のためのフォールバック（files 内に `defaultLanguage` が無い場合に使用）

      ```json
      {
        "description": "クイズ生成・保存リクエスト（フロント→BFF）",
        "request": "POST /api/v1/quiz-creation/generate",
        "header": "Content-Type: application/json, Authorization: Bearer <token>",
        "body": {
          "title": "React基礎クイズ",
          "description": "React の props / state / コンポーネント分割の基礎を確認するクイズセットです。",
          "defaultLanguage": "javascript",
          "files": [
            {
              "fileName": "src/App.jsx",
              "defaultLanguage": "javascript",
              "content": "// source file content 1",
              "problemCounts": {
                "syntax": 2
              }
            },
            {
              "fileName": "src/index.jsx",
              "defaultLanguage": "javascript",
              "content": "// source file content 2",
              "problemCounts": {
                "syntax": 1
              }
            }
          ]
        },
        "response": {
          "status": 201,
          "body": {
            "quizSetId": 205,
            "totalProblems": 60
          }
        }
      }
      ```

    - **BFF to Services**
        - 処理：クイズ生成と保存
        - サービス：[Generator, Quiz Service]
    
        ```markdown
        1. BFFがリクエストボディの `files` から対象ソースコード群と出題数(problemCounts.syntax など)を読み取る
        2. BFFが Generator Service に files: [{fileName, defaultLanguage, content, problemCounts:{...}}, ...] を渡し、ファイル単位で問題(problems)を生成させる
        3. BFFが Quiz Service に {userId, title, description, problems} を渡し、Quiz Set / Problems をDBに保存する
        ```

        ```json
        {
          "description": "Generator Service へのクイズ生成依頼",
          "request": "POST /generator/generate",
          "header": "Content-Type: application/json",
          "body": {
            "defaultLanguage": "javascript",
            "files": [
              {
                "fileName": "src/App.jsx",
                "defaultLanguage": "javascript",
                "content": "// source file content 1",
                "problemCounts": { "syntax": 2 }
              },
              {
                "fileName": "src/utils.js",
                "defaultLanguage": "javascript",
                "content": "// source file content 2",
                "problemCounts": { "syntax": 1 }
              }
            ]
          },
          "response": {
            "status": 200,
            "body": {
              "problems": [
                {
                  "title": "...",
                  "statement": "...",
                  "sysinFormat": "{\"a\": number, \"b\": [number, number], \"s\": string}",
                  "defaultLanguage": "javascript",
                  "sampleAnswer": "...",
                  "testcases": [
                    { "sysin": { "a": 1, "b": [2, 3], "s": "hello" }, "expected": 4 },
                    { "sysin": { "a": 10, "b": [0, 5], "s": "x" }, "expected": 15 }
                  ]
                }
              ]
            }
          }
        }
        ```

        ```json
        {
          "description": "Quiz Service へのクイズ生成・保存依頼",
          "request": "POST /quiz/quiz-sets/generate",
          "header": "Content-Type: application/json",
          "body": {
            "userId": 101,
            "title": "React基礎クイズ",
            "description": "React の props / state / コンポーネント分割の基礎を確認するクイズセットです。",
            "problems": [
              {
                "title": "...",
                "statement": "...",
                "sysinFormat": "{\"a\": number, \"b\": [number, number], \"s\": string}",
                "defaultLanguage": "javascript",
                "sampleAnswer": "...",
                "testcases": [
                  { "sysin": { "a": 1, "b": [2, 3], "s": "hello" }, "expected": 4 },
                  { "sysin": { "a": 10, "b": [0, 5], "s": "x" }, "expected": 15 }
                ]
              }
            ]
          },
          "response": {
            "status": 201,
            "body": {
              "quizSetId": 205,
              "totalProblems": 60
            }
          }
        }
        ```


### /#/quiz-set-list, /#/quiz-list

- GET `/api/v1/quiz-sets`
    - **Frontend to BFF**

      ```json
      {
        "description": "クイズセット一覧取得（フロント→BFF）",
        "request": "GET /api/v1/quiz-sets",
        "header": "Authorization: Bearer <token>",
        "body": null,
        "response": {
          "status": 200,
          "body": [
            {
              "quizSetId": 205,
              "title": "React基礎",
              "description": "",
              "total": 50,
              "completed": 20,
              "progressRate": 40
            },
            {
              "quizSetId": 204,
              "title": "SQL入門",
              "description": "",
              "total": 80,
              "completed": 40,
              "progressRate": 50
            }
          ]
        }
      }
      ```

    - **BFF to Services**
        - 処理：クイズセット一覧
        - サービス：[Quiz Service, Progress Service(problems完了数の取得)]

        ```markdown
        1. Quiz Service からクイズセット一覧を取得する
        2. Progress Service から「各セットごとのユーザー完了問題数」を取得する
        3. セットIDで紐付け、各セット情報に完了数・進捗率を付与して返す
        ```

        ```json
        {
          "description": "(a) Quiz Service からセット一覧を取得",
          "request": "GET /quiz/quiz-sets?userId=101",
          "header": "",
          "body": null,
          "response": {
            "status": 200,
            "body": [
              { "quizSetId": 205, "title": "React基礎", "description": "" },
              { "quizSetId": 204, "title": "SQL入門", "description": "" }
            ]
          }
        }
        ```

        ```json
        {
          "description": "(b) Progress Service から各セットの進捗を取得",
          "request": "GET /progress/status?userId=101&quizSetIds=205,204",
          "header": "",
          "body": null,
          "response": {
            "status": 200,
            "body": {
              "205": { "total":50, "completed": 20, "progressRate": 40 },
              "204": { "total":80, "completed": 40, "progressRate": 50 }
            }
          }
        }
        ```

- GET `/api/v1/quiz-sets/{id}`
    - **Frontend to BFF**

      ```json
      {
        "description": "クイズセット詳細と問題一覧取得（フロント→BFF）",
        "request": "GET /api/v1/quiz-sets/205",
        "header": "Authorization: Bearer <token>",
        "body": null,
        "response": {
          "status": 200,
          "body": {
            "quizSetId": 205,
            "title": "apiへのリクエストの方法",
            "problems": [
              { "problemId": 1001, "title": "...", "defaultLanguage": "python3", "isSolved": true },
              { "problemId": 1002, "title": "...", "defaultLanguage": "python3", "isSolved": true }
            ]
          }
        }
      }
      ```

    - **BFF to Services**
        - 処理：クイズ詳細と問題一覧
        - サービス：[Quiz Service, Progress Service(各problemsが完了しているか)]

        ```markdown
        1. パスパラメータ {id} を受け取る
        2. Quiz Service からセット詳細と含まれる問題リストを取得する
        3. Progress Service から「ユーザーが正解済みの問題IDリスト」を取得する
        4. 問題リストをループし、isSolved フラグを付与して返す
        ```

        ```json
        {
          "description": "(a) Quiz Service からセット詳細を取得",
          "request": "GET /quiz/quiz-sets/205",
          "header": "",
          "body": null,
          "response": {
            "status": 200,
            "body": {
              "quizSetId": 205,
              "title": "apiへのリクエストの方法",
              "problems": [
                { "problemId": 1001, "title": "...", "defaultLanguage": "python3" },
                { "problemId": 1002, "title": "...", "defaultLanguage": "python3" }
              ]
            }
          }
        }
        ```

        ```json
        {
          "description": "(b) Progress Service から解答済みID一覧を取得",
          "request": "GET /progress/solved-problems?userId=101&quizSetId=205",
          "header": "",
          "body": null,
          "response": {
            "status": 200,
            "body": [1001,1002] // 正解済み(完了済み)のproblemのid
          }
        }
        ```


- DELETE `/api/v1/quiz-sets/{id}`
    - **Frontend to BFF**

      ```json
      {
        "description": "クイズセット削除（フロント→BFF）",
        "request": "DELETE /api/v1/quiz-sets/205",
        "header": "Authorization: Bearer <token>",
        "body": null,
        "response": {
          "status": 204,
          "body": null
        }
      }
      ```

    - **BFF to Services**
        - 処理：クイズセットと関連する問題を削除
        - サービス：[Quiz Service]
        - **注意事項**: submissions（提出履歴）は削除されず、孤児レコードとして残る

        ```markdown
        1. パスパラメータ {id} を受け取る
        2. Quiz Service の DELETE /quiz/quiz-sets/{id} を呼び出す
        3. 成功時は 204 No Content を返す
        4. 該当セットが存在しない場合は 404 Not Found を返す
        ```

        ```json
        {
          "description": "Quiz Service へセット削除を依頼",
          "request": "DELETE /quiz/quiz-sets/205",
          "header": "",
          "body": null,
          "response": {
            "status": 204,
            "body": null
          }
        }
        ```

        > **Note**: クイズセット削除時、`problems` テーブルの関連レコードは
        > `ON DELETE CASCADE` により自動削除される。
        > 一方、`submissions` テーブルには外部キー制約がないため、
        > 削除された問題への参照（`problem_id`）を持つ提出履歴は孤児レコードとして残る。


### /#/quiz-play

- GET `/api/v1/problems/{id}`
    - **Frontend to BFF**

      ```json
      {
        "description": "問題詳細取得（フロント→BFF）",
        "request": "GET /api/v1/problems/1002", // languageパラメータがある場合は、その値を採用する（v2）
        "header": "Authorization: Bearer <token>",
        "body": null,
        "response": {
          "status": 200,
          "body": {
            "problemId": 1002,
            "quizSetId": 205,
            "orderIndex": 1,
            "title": "Propsの受け渡し",
            "defaultLanguage": "python3",
            "statement": "## 問題\\n親コンポーネントから `name` というpropsを受け取り、`<div>Hello, {name}</div>` と表示するコンポーネントを作成してください...",
            "sysinFormat": "{\"a\": number, \"b\": [number, number], \"s\": string}",
            "starterCode": "import sys, json\\nsysin = json.loads(sys.stdin.read())\\n# ここから下をユーザが書く\\nresult = None\\nprint(json.dumps(result))\\n",
            "sampleAnswer": "...",
            "testcases": [
              { "sysin": { "a": 1, "b": [2, 3], "s": "hello" }, "expected": 4 },
              { "sysin": { "a": 10, "b": [0, 5], "s": "x" }, "expected": 15 }
            ]
          }
        }
      }
      ```

    - **BFF to Services**
        - 処理：問題詳細の取得
        - サービス：[Quiz Service]

        ```markdown
        1. パスパラメータ {id} (problemId) を受け取る
        2. クエリパラメータ language (v2のみ任意) がある場合はその値を採用する
        3. language が無い場合は Quiz Service から取得した problem の defaultLanguage を採用する
        4. Quiz Service から該当する問題の情報を取得する
        ```

        ```json
        {
          "description": "Quiz Service から問題詳細を取得（模範解答を含む）",
          "request": "GET /quiz/problems/1002",
          "header": "",
          "body": null,
          "response": {
            "status": 200,
            "body": {
              "problemId": 1002,
              "quizSetId": 205,
              "orderIndex": 1,
              "title": "Propsの受け渡し",
              "defaultLanguage": "python3",
              "statement": "## 問題\\n親コンポーネントから `name` というpropsを受け取り、`<div>Hello, {name}</div>` と表示するコンポーネントを作成してください...",
              "sysinFormat": "{\"a\": number, \"b\": [number, number], \"s\": string}",
              "sampleAnswer": "...",
              "testcases": [
                { "sysin": { "a": 1, "b": [2, 3], "s": "hello" }, "expected": 4 },
                { "sysin": { "a": 10, "b": [0, 5], "s": "x" }, "expected": 15 }
              ]
            }
          }
        }
        ```

- POST `/api/v1/runner/execute`
    - **Frontend to BFF**

      ```json
      {
        "description": "コード実行リクエスト（フロント→BFF）",
        "request": "POST /api/v1/runner/execute",
        "header": "Content-Type: application/json, Authorization: Bearer <token>",
        "body": {
          "problemId": 1002,
          "language": "javascript",
          "code": "console.log('Hello');",
          "testcaseIndex": 0
        },
        "response": {
          "status": 200,
          "body": {
            "stdout": "Hello\\n",
            "stderr": "",
            "exitCode": 0
          }
        }
      }
      ```

    - **BFF to Services**
        - 処理：コード実行
        - サービス：[Quiz Service, Executor Service]

        ```markdown
        1. リクエストボディから { problemId, code, language, testcaseIndex } を受け取る
        2. Quiz Service から対象 problem の testcases を取得する
        3. testcases[testcaseIndex].sysin を JSON 文字列化して stdin として用意する
        4. Executor Service の実行APIを { language, code, stdin } で呼び出す
        5. 実行結果(stdout, stderr, exitCode)をそのまま返す
        ```

        ```json
        {
          "description": "Executor Service への実行依頼",
          "request": "POST /executor/execute",
          "header": "Content-Type: application/json",
          "body": {
            "language": "javascript",
            "code": "console.log('Hello');",
            "stdin": "{\\"a\\":1,\\"b\\":[2,3],\\"s\\":\\"hello\\"}"
          },
          "response": {
            "status": 200,
            "body": {
              "stdout": "Hello\\\\n",
              "stderr": "",
              "exitCode": 0
            }
          }
        }
        ```

- POST `/api/v1/submissions`
    - **Frontend to BFF**

      ```json
      {
        "description": "コード提出リクエスト（フロント→BFF）",
        "request": "POST /api/v1/submissions",
        "header": "Content-Type: application/json, Authorization: Bearer <token>",
        "body": {
          "problemId": 1002,
          "language": "javascript",
          "code": "function test() {}"
        },
        "response": {
          "status": 200,
          "body": {
            "isCorrect": true,
            "message": "Correct",
            "details": [
              {
                "testcaseIndex": 0,
                "sysin": {"a": 1, "b": [2, 3], "s": "hello"},
                "expected": 4,
                "stdout": "4\\n",
                "stderr": "",
                "exitCode": 0,
                "passed": true
              }
            ]
          }
        }
      }
      ```

    - **BFF to Services**
        - 処理：コード提出
        - サービス：[Quiz Service, Executor Service, Validator Service, Progress Service (結果保存)]

        ```markdown
        1. userId は認証トークンから取得する
        2. リクエストボディから { problemId, language, code } を受け取る
        3. Quiz Service から対象 problem の testcases を取得する
        4. 各 testcase について stdin=json.dumps(sysin) を作り、Executor Service で実行する
        5. 各 testcase について expected と stdout（必要なら stderr/exitCode）をまとめ、Validator Service に判定依頼する
        6. 採点結果(isCorrect)を受け取る
        7. Progress Service を呼び出し、`submissions` テーブルに結果を保存する
        8. 結果(isCorrect)と詳細(details)をクライアントに返す
        ```

        ```json
        {
          "description": "Validator Service への採点依頼",
          "request": "POST /validator/validate",
          "header": "Content-Type: application/json",
          "body": {
            "cases": [
              {
                "testcaseIndex": 0,
                "expected": 4,
                "stdout": "4\\n",
                "stderr": "",
                "exitCode": 0
              }
            ]
          },
          "response": {
            "status": 200,
            "body": {
              "isCorrect": true,
              "message": "Correct",
              "details": [
                {
                  "testcaseIndex": 0,
                  "passed": true
                }
              ]
            }
          }
        }
        ```


- POST `/api/tutor/hint` ：v2実装