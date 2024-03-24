import { ParseResult, Schema as S } from "@effect/schema"
import { Effect, pipe, Match, Data, Context, Layer } from "effect";
import { HttpClient } from "@effect/platform";

import { loadConfigFromFile } from "../config";

export class TgBotApiError extends Data.TaggedError("TgBotApiError")<{
  response: ApiResponse
}> {
  get message() {
    return Match.value(this.response.description).pipe(
      Match.when(Match.defined, _ => _),
      Match.orElse(() => "unknown response from telegram api")
    )
  }
}

export type TgBotApiHttpClientError = 
  TgBotApiError | 
  HttpClient.error.HttpClientError |
  HttpClient.body.BodyError |
  ParseResult.ParseError

export class TgBotApiHttpClient extends Context.Tag("TgBotApiHttpClient")<
  TgBotApiHttpClient,
  {
    executeMethod(
      method: string, body: unknown
    ): Effect.Effect<unknown, TgBotApiHttpClientError>
  }
>() { }

export const TgBotApiHttpClientLive =
  Layer.effect(
    TgBotApiHttpClient,
    pipe(
      Effect.all({
        baseUrl: pipe(
          loadConfigFromFile,
          Effect.tap(Effect.logDebug("calculating base url")),
          Effect.andThen(config =>
            `https://api.telegram.org/bot${config.botToken}`
          )
        ),
        httpClient: HttpClient.client.Client,
      }),
      Effect.andThen(({ httpClient, baseUrl }) =>
        TgBotApiHttpClient.of({
          executeMethod: (method, body) => pipe(
            HttpClient.body.json(body),
            Effect.andThen(json =>
              httpClient(
                HttpClient.request.post(
                  `${baseUrl}/${method}`, { 
                  body: json 
                })
              )
            ),
            Effect.andThen(_ => _.json),
            Effect.andThen(S.validate(ApiResponse)),
            Effect.andThen(response => 
              Match.value(response).pipe(
                Match.when(
                  Match.defined,
                  _ => Effect.succeed(_.result)
                ),
                Match.orElse(() =>
                  new TgBotApiError({ response })
                )
              )
            ),
            Effect.retry({
              times: 3,
              while: (error) => error._tag === "ResponseError",
            }),
            Effect.scoped,
          )
        })
      )
    )
  );

export type ApiResponse = S.Schema.Type<typeof ApiResponse>
export const ApiResponse = S.struct({
  ok: S.boolean,
  error_code: S.optional(S.number),
  description: S.optional(S.string),
  result: S.optional(S.unknown)
});
