import type { LambdaFunctionURLEvent } from "aws-lambda";
import { Config, Effect } from "effect";

import { lambda } from "#sdk-clients/lambda";
import { s3 } from "#sdk-clients/s3";
import { CONSTANT, ENV_KEYS } from "#/const";

const LockBucketName = Config.nonEmptyString(ENV_KEYS.lockBucket);

export const isWakeupRequest =
  (request: LambdaFunctionURLEvent) =>
    request.rawPath == "/wakeup" && request.requestContext.http.method == "POST"

export enum WakeupResult {
  isLocked = "Already working",
  launched = "Launched"
}

export const wakeUpHandler =
  Effect.gen(function* () {

    const bucket = yield* LockBucketName;

    const files =
      yield* s3("list_objects_v2", {
        Bucket: bucket,
        Prefix: `${CONSTANT.lockFileName}`
      });

    const isLocked = files.KeyCount == 1;

    if (isLocked) return WakeupResult.isLocked;

    yield* lambda("invoke", {
      FunctionName: "buddy-bot-handler",
      InvocationType: "Event"
    });

    return WakeupResult.launched;

  })
