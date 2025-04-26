import { runTgChatBot } from "@effect-ak/tg-bot-client/bot"
import { Config, Effect, Micro, pipe } from "effect"
import { botLogic } from "#/bot/logic"
import { ENV_KEYS } from "#/const";

export const handler = () =>
  Effect.gen(function* () {

    const token = yield* Config.nonEmptyString(ENV_KEYS.botToken);
    const timeout = yield* Config.number(ENV_KEYS.timeoutInSeconds);

    const bot =
      yield* Effect.tryPromise(() =>
        runTgChatBot({
          type: "config",
          bot_token: token,
          mode: {
            type: "single",
            ...botLogic
          },
          poll: {
            log_level: "debug",
            max_empty_responses: 3,
            batch_size: 100
          }
        })
      );

    const result =
      yield* pipe(
        Micro.fiberAwait(bot.fiber()!),
        Effect.tap(Effect.logInfo("")),
        Effect.timeout(`${timeout - 5} seconds`),
        Effect.catchTag("TimeoutException", () => {
          console.info("lambda timeout, interrupting fiber");
          return pipe(
            Micro.fiberInterrupt(bot.fiber()!),
          );
        })
      );

    return result;

  }).pipe(
    Effect.merge,
    Effect.andThen(_ => JSON.stringify(_, undefined, 2)),
    Effect.runPromise
  );
