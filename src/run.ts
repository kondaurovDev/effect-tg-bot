import { ConfigProvider, Effect, Layer, Logger, LogLevel } from "effect";
import { PollingService } from "@effect-ak/tg-bot/misc";
import { NodeFileSystem, NodeRuntime } from "@effect/platform-node";
import { TgBotTokenProvider } from "@effect-ak/tg-bot/api";

import botConfig from "../config.json";
import { messageHandler } from "./message-handler";

const configProvider =
  ConfigProvider.fromJson(botConfig)

const pollingServiceLive =
  Layer.mergeAll(
    PollingService.Default.pipe(
      Layer.provide([
        NodeFileSystem.layer,
        TgBotTokenProvider.fromConfig.pipe(
          Layer.provide(
            Layer.setConfigProvider(configProvider)
          )
        )
      ])
    )
  )

const program = 
  Effect.gen(function* () {

    const polling = yield* PollingService;

    yield* polling.handlerEffect(messageHandler);

  }).pipe(
    // Logger.withMinimumLogLevel(LogLevel.Debug),
    Effect.provide([
      pollingServiceLive,
      NodeFileSystem.layer
    ])
  )

NodeRuntime.runMain(
  program
)
