import { TgBotTokenProvider } from "@effect-ak/tg-bot/api";
import { ConfigProvider, Layer, ManagedRuntime } from "effect";
import { PollingService } from "@effect-ak/tg-bot";
import { TgWebhookService } from "@effect-ak/tg-bot/module";
import { NodeFileSystem } from "@effect/platform-node";

import botConfig from "../../config.json";

const configProviderLayer =
  Layer.setConfigProvider(
    ConfigProvider.fromJson(botConfig)
  );

const botTokenProviderLayer =
  TgBotTokenProvider.fromConfig.pipe(
    Layer.provide(configProviderLayer)
  );

export const localRuntime =
  ManagedRuntime.make(
    Layer.mergeAll(
      PollingService.Default,
      TgWebhookService.Default,
    ).pipe(
      Layer.provide([
        NodeFileSystem.layer,
        botTokenProviderLayer,
        configProviderLayer
      ])
    )
  );
