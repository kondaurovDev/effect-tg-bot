import { Effect, Logger } from "effect";
import { PollingService } from "@effect-ak/tg-bot";
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
    );

  }).pipe(
    // Logger.withMinimumLogLevel(LogLevel.Debug),
    Effect.provide(localRuntime),
    Effect.provide(Logger.pretty)
  )

NodeRuntime.runMain(
  program
);
