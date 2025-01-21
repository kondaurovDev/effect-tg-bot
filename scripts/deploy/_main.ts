import { Effect, Layer } from "effect";
import { NodeContext } from "@effect/platform-node";

import { IAMClientTag, makeIAMClient } from "#sdk-clients/iam";
import { LambdaClientTag, makeLambdaClient } from "#sdk-clients/lambda";
import { ENV_KEYS } from "#/const";
import { getIamFunctionRole, REGION, upsertFunction } from "./function";
import { BotService } from "./bot-service";
import { configureTgBot } from "./configure-bot";

const live =
  Layer.mergeAll(
    Layer.effect(IAMClientTag, makeIAMClient({ region: REGION })),
    Layer.effect(LambdaClientTag, makeLambdaClient({ region: REGION })),
    BotService.Default
  ).pipe(
    Layer.provideMerge(NodeContext.layer)
  );

export const deployFunction =
  Effect.gen(function* () {

    const role = yield* getIamFunctionRole;

    const botService = yield* BotService;

    const timeout = 50;

    yield* upsertFunction({
      functionName: "buddy-bot-bff",
      handler: "dist/bff.handler",
      description: "https://github.com/kondaurovDev/effect-tg-bot",
      timeout: 5,
      enableUrl: true,
      iamRole: role,
      env: {
        BOT_TOKEN: botService.config.bot_token,
        [ENV_KEYS.lockBucket]: "kondaurovdev"
      }
    });

    yield* configureTgBot;

    yield* Effect.logInfo("BotHandler =>")

    yield* upsertFunction({
      functionName: "buddy-bot-handler",
      handler: "dist/bot.handler",
      description: "https://github.com/kondaurovDev/effect-tg-bot",
      timeout,
      enableUrl: false,
      iamRole: role,
      env: {
        BOT_TOKEN: botService.config.bot_token,
        [ ENV_KEYS.timeoutInSeconds ]: `${timeout}`,
        [ ENV_KEYS.lockBucket ]: "kondaurovdev"
      }
    })

  }).pipe(
    Effect.provide(live),
    Effect.catchAllCause(Effect.logError),
    Effect.runPromise
  ).finally(() => console.log("done deployment"));