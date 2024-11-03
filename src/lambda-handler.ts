import { MutexService } from "@effect-ak/effortless/misc"
import { ContextConfigProvider, MainConfigProvider } from "@effect-ak/effortless/provider";
import { NodeFileSystem } from "@effect/platform-node";
import { Context, Effect, Layer, ManagedRuntime } from "effect";

import { SingletonHandler } from "@effect-ak/effortless/lambda"

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

const live = 
  Layer.mergeAll(
    MutexService.Default
  ).pipe(
    Layer.provide([ mainConfig, contextConfig ])
  );

export const handler = 
  SingletonHandler.createLambdaHandler({
    runtime: ManagedRuntime.make(live),
    handle: (input) =>
      Effect.gen(function* () {

        yield* Effect.logInfo("Running function", { input });

        yield* Effect.sleep("10 seconds");

        yield* Effect.logInfo("Done")

      })
  })