import { Effect } from "effect";
import { SingletonHandler } from "@effect-ak/effortless/lambda";
import { PollingService, TgBotMessageHandlerRuntime } from "@effect-ak/tg-bot";

import { handlerRuntime } from "./runtime/handler";
import { messageHandler } from "./bot-logic";

export const handler = 
  SingletonHandler.createLambdaHandler({
    runtime: handlerRuntime,
    handle: (input) =>
      Effect.gen(function* () {

        const polling = yield* PollingService;

        yield* Effect.logInfo("Running function", { input });

        const fiber = yield* polling.handlerEffect(messageHandler).pipe(
          Effect.provideService(TgBotMessageHandlerRuntime, handlerRuntime)
        );

        yield* fiber.pipe(
          Effect.catchAllCause(Effect.logError)
        );

        yield* Effect.logInfo("Done")

      })
  })
