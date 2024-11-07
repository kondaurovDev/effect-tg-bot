import { TgBotTokenProvider, TgPromiseConfigProvider } from "@effect-ak/tg-bot/api";
import { ConfigProvider, Layer, ManagedRuntime } from "effect";
import { PollingService } from "@effect-ak/tg-bot";
import { TgWebhookService } from "@effect-ak/tg-bot/module";
import { NodeFileSystem } from "@effect/platform-node";

import botConfig from "../../config.json";
import { initBackend } from "../ai-service";

const configProvider = 
  ConfigProvider.fromJson(botConfig);

initBackend(configProvider);

const configProviderLayer =
  Layer.setConfigProvider(configProvider);

const botTokenProviderLayer =
  TgBotTokenProvider.fromConfig.pipe(
    Layer.provide(configProviderLayer)
  );

export const localRuntime =
  ManagedRuntime.make(
    Layer.mergeAll(
      PollingService.Default.pipe(
        Layer.provide(
          Layer.succeed(
            TgPromiseConfigProvider,
            TgPromiseConfigProvider.of(configProvider)
          )
        )
      ),
      TgWebhookService.Default,
    ).pipe(
      Layer.provide([
        NodeFileSystem.layer,
        botTokenProviderLayer,
        configProviderLayer
      ])
    )
  );