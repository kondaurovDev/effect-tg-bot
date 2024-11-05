import { MutexService } from "@effect-ak/effortless/misc"
import { ContextConfigProvider, MainConfigProvider } from "@effect-ak/effortless/provider";
import { SSM } from "@effect-ak/effortless/aws";
import { NodeFileSystem } from "@effect/platform-node";
import { ConfigProvider, Context, Effect, Layer, ManagedRuntime, pipe } from "effect";

import { SingletonHandler } from "@effect-ak/effortless/lambda"
import { TgBotService } from "@effect-ak/tg-bot";
import { TgBotTokenProvider } from "@effect-ak/tg-bot/api";

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
      yield* ssm.hierarchy.get({ start: "/effect-tg-bot"});

    yield* Effect.logInfo("Resolved config", [...parameters.keys()])

    const cp = ssm.makeConfigProvider(parameters);

    return Layer.setConfigProvider(cp);

  }).pipe(
    Layer.unwrapEffect
  )

const tokenProvider =
  Layer.merge(
    TgBotTokenProvider.fromConfig,
    layerWithConfig
  )

const live = 
  Layer.mergeAll(
    MutexService.Default,
    TgBotService.Default
  ).pipe(
    Layer.provide([ 
      contextConfig, tokenProvider, NodeFileSystem.layer
    ])
  );

export const handler = 
  SingletonHandler.createLambdaHandler({
    runtime: ManagedRuntime.make(live),
    handle: (input) =>
      Effect.gen(function* () {

        // const chat = yield* TgBotChat.TgChatService;

        // chat.sendMessage({
        //   chat_id: TgBotChat.ChatId.make(123123),
        //   text: "up"
        // })

        yield* Effect.logInfo("Running function", { input });

        yield* Effect.sleep("30 seconds");

        yield* Effect.logInfo("Done")

      })
  })
