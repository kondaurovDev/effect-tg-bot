import { Config, ConfigProvider, Effect, Layer, pipe } from "effect";

const layerWithMyConfigProvider = 
  Layer.setConfigProvider(
    ConfigProvider.fromJson({
      parentProp: "some prop value"
    })
  )

const printProp = 
  pipe(
    Config.nonEmptyString("parentProp"),
    Effect.andThen(prop =>
      Effect.log("propery value from parent", prop)
    ),
    Effect.provide(layerWithMyConfigProvider),
    Effect.runPromise
  )

const child = 
  pipe(
    Effect.sleep("1 second"),
    Effect.tap(Effect.logInfo("child is working")),
    Effect.tap(prop => {

      try {
        printProp
      } catch (e) {
        console.error(e)
      }

      return Effect.void
    })
  )

const parent = 
  await pipe(
    Effect.forkDaemon(child),
    Effect.tap(Effect.logInfo("parent is working")),
    Effect.provide(layerWithMyConfigProvider),
    Effect.runPromise
  )
