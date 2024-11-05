import { Effect, Logger, LogLevel } from "effect";
import { PollingService, TgBotMessageHandlerRuntime } from "@effect-ak/tg-bot";
import { NodeRuntime } from "@effect/platform-node";
import { TgWebhookService } from "@effect-ak/tg-bot/module";

import { messageHandler } from "./bot-logic";
import { localRuntime } from "./runtime/local";

const program = 
  Effect.gen(function* () {

    const polling = yield* PollingService;
    const webhook = yield* TgWebhookService;

    const webhookInfo = yield* webhook.webhookInfo.effect;

    yield* Effect.logInfo("webhook", webhookInfo);

    const fiber = yield* polling.handlerEffect(messageHandler);

    yield* fiber.pipe(
      Effect.catchAllCause(Effect.logError)
    )

  }).pipe(
    Logger.withMinimumLogLevel(LogLevel.Debug),
    Effect.provide(localRuntime),
    Effect.provide(Logger.structured),
    Effect.provideService(TgBotMessageHandlerRuntime, localRuntime)
  )

NodeRuntime.runMain(
  program
);
