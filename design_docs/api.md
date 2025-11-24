## 画面、BFF API、Service API

- 命名規則：bffは `/api/*` （フロントエンドから見たらただのAPIのため）

### /#/login, /#/signup

- POST `/api/auth/signup`
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
    
- POST `/api/auth/login`
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

- GET `/api/dashboard/summary`
    - 処理：クイズ総数と完了数
    - サービス：[Quiz Service, Progress Service]
    
    ```markdown
    1. 並列で以下を実行する
       a. Quiz Service から「ユーザが作成したクイズ全問題数」を取得
       b. Progress Service から「ユーザーのユニーク正解数」を取得
    2. 両方の結果をマージして { totalProblems, completedProblems } を返す
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
    
- GET `/api/dashboard/categories`
    - 処理：カテゴリ毎の数と完了数
    - サービス：[Quiz Service, Progress Service]
    
    ```markdown
    1. 並列で以下を実行する
       a. Quiz Service から「ユーザが作成したカテゴリ別の全問題数」を取得
       b. Progress Service から「ユーザーのカテゴリ別正解数」を取得
    2. カテゴリをキーにしてデータを結合し、リスト形式で返す
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
      "description": "(b) Progress Service から「ユーザーのカテゴリ別正解数」を取得",
      "request": "GET /progress/stats/categories?userId=101",
      "header": "",
      "body": null,
      "response": {
        "status": 200,
        "body": [
          { "category": "Frontend", "solved": 20 },
          { "category": "Backend", "solved": 25 }
        ]
      }
    }
    ```
    
- GET `/api/dashboard/activities`
    - 処理：指定期間の日毎取り組み数
    - サービス：[Progress Service]
    
    ```markdown
    1. BFFがクエリパラメータから期間(period=7,30,all)を受け取る
    2. Progress Service の集計APIを呼び出し、日毎の「正解数」を取得する
    3. 正解が無い日は0
    ```
    
    ```json
    {
      "description": "Progress Service から「日毎の正解数」を取得",
      "request": "GET /progress/activities?userId=101&period=30",
      "header": "",
      "body": null,
      "response": {
        "status": 200,
        "body": [
          { "date": "2023-10-01", "count": 3 },
          { "date": "2023-10-02", "count": 0 }
        ]
      }
    }
    ```
    

### /#/quiz-creation

- POST `/api/quiz-creation/upload`
    - 処理：ディレクトリファイルのアップロード
    - サービス：[Quiz Service]
    
    ```markdown
    1. BFFがファイル群とパス情報を受け取る
    2. quiz-source-dataにディレクトリ構造を維持した状態でjsonで保存する
    ```
    
    ```json
    {
      "description": "Quiz Service へ「ファイル群json」の保存リクエスト",
      "request": "POST /quiz/source-data",
      "header": "Content-Type: application/json",
      "body": {
        "userId": 101,
        "project_name": "my-react-app",
        "files": [
          { "path": "src/App.js", "content": "..." },
          { "path": "package.json", "content": "..." }
        ]
      },
      "response": {
        "status": 201,
        "body": {
          "sourceId": 5001,
          "message": "Upload successful"
        }
      }
    }
    ```
    
- GET `/api/quiz-creation/analysis` （v2実装なので、v1では実装しない）
    - 処理：アップロード済みのファイル群からディレクトリツリー構造とLLM説明書きの取得
    - サービス：[Quiz Service, Generator(LLMでファイル説明作成)]
    
    ```markdown
    1. Quiz Service から、対象のファイル/ディレクトリ構造を読み出す
    2. ディレクトリ名や主要なファイルの内容を抜粋し、Generator (LLM) に投げる
    3. LLMにより「各ディレクトリ・ファイルの概要説明」を生成する
    4. ツリー構造のJSONデータに説明文（description）を付与して返す
    ```
    
    ```json
    {
      "description": "Quiz Service から解析済みツリー構造を取得(内部でGenerator呼び出し)",
      "request": "GET /quiz/source-data/5001/analysis",
      "header": "",
      "body": null,
      "response": {
        "status": 200,
        "body": {
          "root": {
            "name": "my-react-app",
            "type": "directory",
            "description": "Generated by LLM...",
            "children": []
          }
        }
      }
    }
    ```
    
- POST `/api/quiz-creation/generate`
    - 処理：クイズ生成と保存（フォルダやファイルのクイズ生成範囲の指定はv2）
    - サービス：[Generator, Quiz Service]
    
    ```markdown
    1. BFFがリクエストボディから、クイズの設定やツリー情報(クイズ範囲)を受け取る
    2. Quiz Service から、ディレクトリに含まれるファイルの中身を取得する
    3. ファイル内容とクイズ設定をあわせて Generator に投げ、問題(problems)を生成させる
    4. Quiz Service が新しい「Quiz Set」を作成し、生成された「Problems」を紐付けてDBに保存する
    ```
    
    ```json
    {
      "description": "Quiz Service へのクイズ生成・保存依頼",
      "request": "POST /quiz/quiz-sets/generate",
      "header": "Content-Type: application/json",
      "body": {
        "userId": 101,
        "sourceId": 5001,  // quiz-source-dataのid
        "title": "React基礎クイズ",
        "problemCounts": {
    		  "problemCounts": {
    	    "syntax": 30,        // 基本文法
    	    "logic": 0,         // 処理 (制御構文、アルゴリズム)
    	    "function": 20,      // 関数
    	    "class": 10          // クラス・モジュール
        },
        "customInstruction":"api系の文法の問題多めで"
        "excludePaths": ["/src/App.js"] // ディレクトリから除外する（v2で実装）
      },
      "response": {
        "status": 201,
        "body": {
          "quizSetId": 205
        }
      }
    }
    ```
    

### /#/quiz-set-list, /#/quiz-list

- GET `/api/quiz-sets`
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
    
- GET `/api/quiz-sets/{id}`
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
            { "problemId": 1001, "title": "...", "description": "" },
            { "problemId": 1002, "title": "..." "description": "" }
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
    

### /#/quiz-play

- GET `/api/problems/{id}`
    - 処理：問題詳細の取得
    - サービス：[Quiz Service]
    
    ```markdown
    1. パスパラメータ {id} (problemId) を受け取る
    2. Quiz Service から該当する問題の情報を取得する
    ```
    
    ```json
    {
      "description": "Quiz Service から問題詳細を取得（模範解答は隠蔽）",
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
          "description": "親コンポーネントから子コンポーネントへデータを渡す基礎的な問題です。"
          "contentMarkdown": "## 問題\\n親コンポーネントから `name` というpropsを受け取り、`<div>Hello, {name}</div>` と表示するコンポーネントを作成してください...",
          "sampleAnswer": "..."
        }
      }
    }
    
    ```
    
- POST `/api/runner/execute`
    - 処理：コード実行
    - サービス：[Executor Service]
    
    ```markdown
    1. リクエストボディから { code, language } を受け取る
    2. Executor Service の実行APIを呼び出す
    3. 実行結果(stdout, stderr, exitCode)をそのまま返す
    ```
    
    ```json
    {
      "description": "Executor Service への実行依頼",
      "request": "POST /executor/execute",
      "header": "Content-Type: application/json",
      "body": {
        "language": "javascript",
        "code": "console.log('Hello');"
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
    
- POST `/api/submissions`
    - 処理：コード提出
    - サービス：[Validator Service, Progress Service (結果保存)]
    
    ```markdown
    1. リクエストボディから { userId, problemId, submittedCode } を受け取る
    2. Validator Service を呼び出し、採点を行う
       (Validator内部で `problems.sample_answer` またはテストケースを取得して判定)
    3. 採点結果(isCorrect)を受け取る
    4. Progress Service を呼び出し、`submissions` テーブルに結果を保存する
    5. 結果(isCorrect)と実行ログをクライアントに返す
    ```
    
    ```json
    {
      "description": "Validator Service への採点依頼",
      "request": "POST /validator/validate",
      "header": "Content-Type: application/json",
      "body": {
        "userId": 101,
        "problemId": 1002,
        "submittedCode": "function test() {}"
      },
      "response": {
        "status": 200,
        "body": {
          "isCorrect": true,
          "message": "Correct",
          "executionResult": { "stdout": "Pass", "exitCode": 0 }
        }
      }
    }
    
    ```
    
- POST `/api/tutor/hint` ：v2実装