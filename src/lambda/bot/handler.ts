import { BotFactoryServiceDefault } from "@effect-ak/tg-bot-client"
import { Config, Effect, Layer, Micro, pipe } from "effect"
import { botLogic } from "#/bot/logic"
import { makeS3Client, S3ClientTag } from "#sdk-clients/s3"
import { lock, unlock } from "./mutex";

const live =
  Layer.mergeAll(
    Layer.effect(S3ClientTag, makeS3Client({}))
  );

export const handler = () =>
  Effect.gen(function* () {

    yield* lock;

    const token = yield* Config.nonEmptyString("BOT_TOKEN");
    const timeout = yield* Config.number("TIMEOUT_SECONDS");

    const bot =
      yield* BotFactoryServiceDefault
        .runBot({
          type: "config",
          log_level: "debug",
          bot_token: token,
          max_empty_responses: 3,
          ...botLogic
        });

    const result =
      yield* pipe(
        Micro.fiberAwait(bot.fiber()!),
        Effect.andThen(unlock),
        Effect.andThen(result => ({ unlock: result })),
        Effect.timeout(`${timeout - 5} seconds`),
        Effect.catchTag("TimeoutException", () => {
          console.log("lambda timeout, interrupting fiber");
          return pipe(
            Micro.fiberInterrupt(bot.fiber()!),
            Effect.andThen(() => unlock),
            Effect.andThen(result => ({ unlocked: result }))
          );
        })
      );

    return result;

  }).pipe(
    Effect.merge,
    Effect.andThen(_ => JSON.stringify(_, undefined, 2)),
    Effect.provide(live),
    Effect.runPromise
  );
