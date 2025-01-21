import { Effect, Schema as S } from "effect";
import { FileSystem } from "@effect/platform";
import { makeTgBotClient } from "@effect-ak/tg-bot-client";

export class BotService
  extends Effect.Service<BotService>()("BotService", {
    effect:
      Effect.gen(function* () {

        const config =
          yield* getBotConfig;

        const client =
          makeTgBotClient({
            bot_token: config.bot_token
          });

        return {
          config,
          client
        }

      })
  }) { }


const getBotConfig =
  Effect.gen(function* () {

    const fs = yield* FileSystem.FileSystem;

    const conf = yield* fs.readFileString("config.json");

    const config =
      yield* S.decode(S.parseJson(S.Struct({ bot_token: S.NonEmptyString })))(conf);

    return config;

  })