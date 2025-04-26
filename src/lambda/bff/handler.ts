import { BotService } from "#/bot/client";
import { configureTgBot } from "#/bot/configure-bot";
import { LambdaFunctionURLHandler } from "aws-lambda";

import { Effect } from "effect";

export const handler: LambdaFunctionURLHandler = (request) =>
  Effect.gen(function* () {

    if (request.rawPath == "/api/configure") {
      const result = yield* configureTgBot().pipe(Effect.merge);
      return {
        statusCode: 200,
        body: JSON.stringify(result, undefined, 2),
        headers: {
          "content-type": "application/json; charset=utf-8"
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        error: "Not implemented yet",
        request
      })
    }

  }).pipe(
    Effect.provide(BotService.Default),
    Effect.runPromise,
  )

// const getMainHtml =
//   Effect.tryPromise(() => 
//     readFile("dist/wakeup.html")
//       .then(_ => _.toString("utf-8"))
//       .catch(() => "<h3>Page not found</h3>")
//   ).pipe(
//     Effect.cached,
//     Effect.flatten
//   );
