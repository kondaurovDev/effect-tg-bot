import { launchBot } from "@effect-ak/tg-bot-client/bot";
import { Effect, Micro, Schema as S } from "effect";
import { botLogic } from "./bot/logic";
import { workerData } from "worker_threads"

const getWorkerData =
  Effect.fn("get worker data")(() =>
    S.decodeUnknown(S.Struct({ token: S.NonEmptyString }))(workerData)
  )

Effect.gen(function* () {

  const { token } = yield* getWorkerData();

  const { fiber } =
    yield* launchBot({
      bot_token: token,
      mode: {
        type: "single",
        ...botLogic
      },
      poll: {
        log_level: "info",
        poll_timeout: 60
      }
    });

  yield* Micro.fiberAwait(fiber()!)
}).pipe(
  Effect.tapErrorCause(Effect.logError),
  Effect.runPromiseExit
);
