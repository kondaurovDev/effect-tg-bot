import { Effect, Layer } from "effect";
import { NodeFileSystem } from "@effect/platform-node";

import { IAMClientTag, makeIAMClient } from "#sdk-clients/iam";
import { LambdaClientTag, makeLambdaClient } from "#sdk-clients/lambda";
import { getIamFunctionRole, REGION, upsertFunction } from "./function";

const live =
  Layer.mergeAll(
    Layer.effect(IAMClientTag, makeIAMClient({ region: REGION })),
    Layer.effect(LambdaClientTag, makeLambdaClient({ region: REGION })),
    NodeFileSystem.layer
  );

export const deployFunction =
  Effect.gen(function* () {

    const role = yield* getIamFunctionRole;

    yield* Effect.all({
      requestFn: upsertFunction({
        functionName: "buddy-bot-handler",
        handler: "dist/lambda-run.handler",
        description: "https://github.com/kondaurovDev/effect-tg-bot",
        timeout: 3,
        enableUrl: true,
        iamRole: role,
        env: {}
      })
    }, { 
      concurrency: "unbounded" 
    });

  }).pipe(
    Effect.provide(live),
    Effect.catchAllCause(Effect.logError),
    Effect.runPromise
  ).finally(() => console.log("done deployment"));