import {
  Data, Context, Duration, Effect, Layer, LogLevel, Logger, Match, Ref, Schedule, pipe
} from "effect";

import { NodeHttpClient } from "@effect/platform-node";
import { MessageUpdate } from "./update-object";
import { DiceEmoji, TgBotApi, TgBotApiLive } from "./bot-api";

type LastUpdateId = number | undefined;
const LastUpdateId = Context.GenericTag<Ref.Ref<LastUpdateId>>("LastUpdateId");

interface BotResponse {
  readonly _tag: "BotResponse"
  readonly text?: string
  readonly dice?: DiceEmoji
}

export const BotResponse = Data.tagged<BotResponse>("BotResponse");

export type OnMessage =
  (_: MessageUpdate) => BotResponse

const onMsg = (
  message: MessageUpdate,
  onMessage: OnMessage
) => pipe(
  Effect.all({
    answer: Effect.try(() => onMessage(message)),
    client: TgBotApi
  }),
  Effect.andThen(({ answer, client }) => pipe(
    client.sendChatAction({
      action: "typing",
      chat_id: message.from.id
    }),
    Effect.andThen(() => Effect.sleep(2000)),
    Effect.tap(() => 
      Match.value(answer.text).pipe(
        Match.when(
          Match.defined, (text) => client.sendMessage({
            chat_id: message.from.id,
            text
          })
        ),
        Match.orElse(() => Effect.unit)
      )
    ),
    Effect.tap(() =>
      Match.value(answer.dice).pipe(
        Match.when(
          Match.defined, (dice) => client.sendDice({
            chat_id: message.from.id,
            emoji: dice
          }),
        ),
        Match.orElse(() => Effect.unit)
      )
    )
  )),
);

const fetchLastUpdates =
  pipe(
    Effect.all({
      lastUpdateId: Effect.andThen(LastUpdateId, Ref.get),
      client: TgBotApi
    }),
    Effect.andThen(({ lastUpdateId, client }) =>
      client.getUpdates({
        allowed_updates: "message",
        limit: 10,
        offset: lastUpdateId ? lastUpdateId + 1 : lastUpdateId,
        timeout: 10
      })
    )
  );

export const handleBotMessages = (
  onMessage: OnMessage
) => Layer.effectDiscard(
  pipe(
    fetchLastUpdates,
    Effect.tap((request) =>
      Effect.logInfo(`got updates: ${request.length}`),
    ),
    Effect.tap(
      Effect.forEach(update =>
        Match.value(update.message).pipe(
          Match.when(
            { text: "/dice" },
            message => onMsg(message, onMessage)
          ),
          Match.when(
            Match.defined,
            message => onMsg(message, onMessage)
          ),
          Match.orElse(() => Effect.unit)
        )
      )
    ),
    Effect.tap(updates => pipe(
      LastUpdateId,
      Effect.andThen(ref =>
        Ref.update(ref, () => updates.at(-1)?.update_id)
      )
    )),
    Effect.repeat({
      schedule: Schedule.fixed(Duration.seconds(1))
    }),
    Effect.provideServiceEffect(LastUpdateId, Ref.make<LastUpdateId>(undefined)),
    Effect.provide(
      TgBotApiLive.pipe(
        Layer.provide(NodeHttpClient.layer)
      )
    ),
    Logger.withMinimumLogLevel(LogLevel.Debug),
  )

)
