import { MutexService } from "@effect-ak/effortless/misc"
import { ContextConfigProvider, MainConfigProvider } from "@effect-ak/effortless/provider";
import { SSM } from "@effect-ak/effortless/aws";
import { NodeFileSystem } from "@effect/platform-node";
import { Context, Effect, Layer, ManagedRuntime } from "effect";
import { PollingService, TgBotService } from "@effect-ak/tg-bot";
import { TgBotTokenProvider } from "@effect-ak/tg-bot/api";
import { AiMainService } from "@effect-ak/ai";
import { initBackend } from "../ai-service";

const mainConfig =
  Layer.provideMerge(
    MainConfigProvider.Default,
    NodeFileSystem.layer
  );

const contextConfig =
  Layer.flatMap(
    mainConfig,
    context =>
      Layer.effect(
        ContextConfigProvider,
        Context.get(context, MainConfigProvider).contextConfig
      )
  );

const layerWithConfig =
  Effect.gen(function* () {

    const ssm = yield* SSM.AwsSsm;

    const parameters =
      yield* ssm.hierarchy.get({ start: "/effect-tg-buddy" });

    yield* Effect.logInfo("Resolved config", [...parameters.keys()])

    const cp = ssm.makeConfigProvider(parameters);

    initBackend(cp);

    return Layer.setConfigProvider(cp);

  }).pipe(
    Layer.unwrapEffect,
    Layer.provide(SSM.AwsSsm.Default),
    Layer.provide(contextConfig)
  )

export const aiLayer =
  AiMainService.Default

const tokenProvider =
  TgBotTokenProvider.fromConfig.pipe(
    Layer.provide(layerWithConfig)
  )

export const handlerRuntime =
  ManagedRuntime.make(
    Layer.mergeAll(
      MutexService.Default,
      TgBotService.Default,
      PollingService.Default,
      layerWithConfig
    ).pipe(
      Layer.provide([
        contextConfig, tokenProvider, NodeFileSystem.layer
      ])
    )
  )