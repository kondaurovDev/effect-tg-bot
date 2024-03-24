import { Context, Effect, Layer, Ref, pipe } from "effect";
import { UpdateObject } from "./update-object";
import { TgBotApiHttpClient, TgBotApiHttpClientError, TgBotApiHttpClientLive } from "./http-client";

import { Schema as S } from "@effect/schema";

type LastUpdateId = number | undefined;
const LastUpdateId = Context.GenericTag<Ref.Ref<LastUpdateId>>("LastUpdateId");

export class TgBotApi extends Context.Tag("TgBotApi")<
  TgBotApi,
  {
    getUpdates(
      request: GetUpdates
    ): Effect.Effect<readonly UpdateObject[], TgBotApiHttpClientError>
    sendMessage(
      request: SendMessage
    ): Effect.Effect<void, TgBotApiHttpClientError>
    sendChatAction(
      request: SendChatAction
    ): Effect.Effect<void, TgBotApiHttpClientError>
    sendDice(
      request: SendDice
    ): Effect.Effect<void, TgBotApiHttpClientError>
  }
>() { }

export const TgBotApiLive =
  Layer.effect(
    TgBotApi,
    pipe(
      TgBotApiHttpClient,
      Effect.andThen(client =>
        TgBotApi.of({
          getUpdates: request =>
            pipe(
              S.validate(GetUpdates)(request),
              Effect.andThen(() =>
                client.executeMethod("getUpdates", request)
              ),
              Effect.andThen(S.validate(S.array(UpdateObject))),
            ),
          sendMessage: request =>
            pipe(
              S.validate(SendMessage)(request),
              Effect.tap(() =>
                client.executeMethod("sendMessage", request)
              ),
              Effect.andThen(Effect.unit)
            ),
          sendChatAction: request =>
            pipe(
              S.validate(SendChatAction)(request),
              Effect.tap(() =>
                client.executeMethod("sendChatAction", request)
              ),
              Effect.andThen(Effect.unit)
            ),
          sendDice: request =>
            pipe(
              S.validate(SendDice)(request),
              Effect.tap(() =>
                client.executeMethod("sendDice", request)
              ),
              Effect.andThen(Effect.unit)
            ),
        })
      )
    )
  ).pipe(
    Layer.provide(TgBotApiHttpClientLive)
  );

export type GetUpdates = S.Schema.Type<typeof GetUpdates>;
export const GetUpdates = S.struct({
  offset: S.optional(S.number),
  limit: S.optional(S.number.pipe(S.greaterThan(1), S.lessThan(100))),
  timeout: S.optional(S.number.pipe(S.greaterThanOrEqualTo(0))),
  allowed_updates: S.optional(S.keyof(
    UpdateObject.pipe(S.omit("update_id"))
  ))
});

export type SendMessage = S.Schema.Type<typeof SendMessage>;
export const SendMessage = S.struct({
  text: S.NonEmpty,
  chat_id: S.number,
});

type SendChatAction = S.Schema.Type<typeof SendChatAction>;
const SendChatAction = S.struct({
  action: S.literal(
    "typing", "upload_photo", "record_video"
  ),
  chat_id: S.number,
});

export type DiceEmoji = S.Schema.Type<typeof DiceEmoji>;
const DiceEmoji = S.union(
  S.literal("🎲"), S.literal("🎯"), S.literal("🏀"),
  S.literal("⚽"), S.literal("🎰"),
);

type SendDice = S.Schema.Type<typeof SendDice>;
const SendDice = S.struct({
  emoji: DiceEmoji,
  chat_id: S.number,
});
