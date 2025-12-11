{
  "apiVersion": "1.0",
  "swaggerVersion": "1.2",
  "basePath": "https://api.paiza.io",
  "resourcePath": "runners",
  "apis": [
    {
      "path": "/runners/get_status.json",
      "operations": [
        {
          "summary": "Get status of current session",
          "notes": "Get status of current session",
          "parameters": [
            {
              "paramType": "query",
              "name": "api_key",
              "type": "string",
              "description": "API Key always 'guest'",
              "required": true
            },
            {
              "paramType": "query",
              "name": "id",
              "type": "integer",
              "description": "session id (returned by 'create' API)",
              "required": true
            }
          ],
          "responseMessages": [
            {
              "code": 200,
              "responseModel": null,
              "message": "<br/>JSON hash.<br/>{<br/>  id: session id,<br/>  status: status('running', 'completed'),<br/>  error: error message.<br/>}<br/>"
            }
          ],
          "nickname": "Runners#get_status",
          "method": "get"
        }
      ]
    },
    {
      "path": "/runners/get_details.json",
      "operations": [
        {
          "summary": "Get detailed session information.",
          "notes": "Get detailed session information.",
          "parameters": [
            {
              "paramType": "query",
              "name": "api_key",
              "type": "string",
              "description": "API Key always 'guest'",
              "required": true
            },
            {
              "paramType": "query",
              "name": "id",
              "type": "integer",
              "description": "session id (returned by 'create' API)",
              "required": true
            }
          ],
          "responseMessages": [
            {
              "code": 200,
              "responseModel": null,
              "message": "<br/>    JSON hash.<br/>{<br/>\tid: Session id<br/>\tlanguage: language,<br/>\tstatus: status('running', 'completed'),<br/>\tbuild_stdout: build output to stdout,<br/>\tbuild_stderr: build output to stderr,<br/>\tbuild_exit_code: build exit code,<br/>\tbuild_time: build time(second),<br/>\tbuild_memory: build memory usage(bytes),<br/>\tbuild_result: build result('success', 'failure', 'error'),<br/>\tstdout: code output to stdout,<br/>\tstderr: code output to stderr,<br/>\texit_code: exit code,<br/>\ttime: time to run(seconds),<br/>\tmemory: code memory usage(bytes),<br/>\tresult: code result('success', 'failure', 'error'),<br/>}<br/>"
            }
          ],
          "nickname": "Runners#get_details",
          "method": "get"
        }
      ]
    },
    {
      "path": "/runners/create.json",
      "operations": [
        {
          "summary": "Create runner session to build and run code.",
          "notes": "Create runner session to build and run code.",
          "parameters": [
            {
              "paramType": "query",
              "name": "api_key",
              "type": "string",
              "description": "API Key always 'guest'",
              "required": true
            },
            {
              "paramType": "query",
              "name": "source_code",
              "type": "string",
              "description": "Source code",
              "required": true
            },
            {
              "paramType": "query",
              "name": "language",
              "type": "string",
              "description": "Language",
              "required": true,
              "allowableValues": {
                "valueType": "LIST",
                "values": [
                  "c",
                  "cpp",
                  "objective-c",
                  "java",
                  "kotlin",
                  "scala",
                  "swift",
                  "csharp",
                  "go",
                  "haskell",
                  "erlang",
                  "perl",
                  "python",
                  "python3",
                  "ruby",
                  "php",
                  "bash",
                  "r",
                  "javascript",
                  "coffeescript",
                  "vb",
                  "cobol",
                  "fsharp",
                  "d",
                  "clojure",
                  "elixir",
                  "mysql",
                  "rust",
                  "scheme",
                  "commonlisp",
                  "nadesiko",
                  "typescript",
                  "brainfuck",
                  "plain"
                ]
              }
            },
            {
              "paramType": "query",
              "name": "input",
              "type": "string",
              "description": "Input data for the program. Program read this data from standard input.",
              "required": false
            }
          ],
          "responseMessages": [
            {
              "code": 200,
              "responseModel": null,
              "message": "<br/>JSON hash.<br/>{<br/>  id: session id(This should be used in get_status/get_details API),<br/>  status: status('running', 'completed'),<br/>  error: error message.<br/>}<br/>"
            }
          ],
          "nickname": "Runners#create",
          "method": "post"
        }
      ]
    }
  ],
  "authorizations": null
}