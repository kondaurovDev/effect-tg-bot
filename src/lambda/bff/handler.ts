import { readFile } from "fs/promises";
import { LambdaFunctionURLHandler } from "aws-lambda";

import { makeLambdaClient, LambdaClientTag } from "#sdk-clients/lambda";
import { makeS3Client, S3ClientTag } from "#sdk-clients/s3";
import { Effect, Layer } from "effect";
import { isWakeupRequest, wakeUpHandler } from "./wakeup";

const live =
  Layer.mergeAll(
    Layer.effect(LambdaClientTag, makeLambdaClient({})),
    Layer.effect(S3ClientTag, makeS3Client({}))
  );

export const handler: LambdaFunctionURLHandler = (request) =>
  Effect.gen(function* () {

    yield* Effect.logInfo("request", request);

    if (isWakeupRequest(request)) {
      const result = yield* wakeUpHandler;
      return {
        statusCode: 200,
        body: JSON.stringify(result, undefined, 2),
        headers: {
          "content-type": "application/json; charset=utf-8"
        }
      };
    };

    const page = yield* getMainHtml;

    return {
      statusCode: 200,
      headers: {
        "content-type": "text/html; charset=utf-8"
      },
      body: page
    };

  }).pipe(
    Effect.provide(live),
    Effect.runPromise
  )

const getMainHtml =
  Effect.tryPromise(() => 
    readFile("dist/wakeup.html")
      .then(_ => _.toString("utf-8"))
      .catch(() => "<h3>Page not found</h3>")
  ).pipe(
    Effect.cached,
    Effect.flatten
  );
