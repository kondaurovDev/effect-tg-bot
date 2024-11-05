import { ConfigProvider, Effect, Layer, Logger, LogLevel } from "effect";
import { PollingService } from "@effect-ak/tg-bot";
import { NodeFileSystem, NodeRuntime } from "@effect/platform-node";
import { TgBotTokenProvider } from "@effect-ak/tg-bot/api";

import botConfig from "../config.json";
import { messageHandler } from "./message-handler";
import { TgWebhookService } from "@effect-ak/tg-bot/module";

const configProvider =
  ConfigProvider.fromJson(botConfig);

const botTokenProvider =
  TgBotTokenProvider.fromConfig.pipe(
    Layer.provide(
      Layer.setConfigProvider(configProvider)
    )
  )

const tgLive =
  Layer.mergeAll(
    PollingService.Default,
    TgWebhookService.Default
  ).pipe(
    Layer.provide([
      NodeFileSystem.layer,
      botTokenProvider
    ])
  );

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
    // Logger.withMinimumLogLevel(LogLevel.Debug),
    Effect.provide([
      tgLive,
      NodeFileSystem.layer,
      Logger.pretty,
    ])
  )

NodeRuntime.runMain(
  program
)
