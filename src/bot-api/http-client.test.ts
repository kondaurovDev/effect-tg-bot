import { Effect, Layer, LogLevel, Logger, pipe } from "effect"
import { HttpClient } from "@effect/platform"
import { TgBotApiHttpClient, TgBotApiHttpClientLive } from "./http-client";
import { loadConfigFromFile } from "../config";

describe("telegram bot http api", () => {

  const requestHandler = {
    executeHttp: (
      request: HttpClient.request.ClientRequest
    ) => Effect.succeed(
      HttpClient.response.fromWeb(
        request, new Response(JSON.stringify({
          ok: true, result: { foo: "bar" }
        }))
      )
    )
  };

  jest.spyOn(requestHandler, "executeHttp");

  const TestLayer =
    Layer.mergeAll(
      Layer.succeed(
        HttpClient.client.Client,
        HttpClient.client.makeDefault(requestHandler.executeHttp)
      )
    )

  it("should create a correct request", async () => {

    const response = await pipe(
      TgBotApiHttpClient,
      Effect.andThen(tgBotApi =>
        tgBotApi.executeMethod("getUpdates", { limit: 123 })
      ),
      Effect.provide(TgBotApiHttpClientLive),
      Effect.provide(TestLayer),
      Logger.withMinimumLogLevel(LogLevel.Debug),
      Effect.runPromise
    );

    expect(response).toMatchObject({ foo: "bar" });

    const config = await pipe(
      loadConfigFromFile,
      Effect.runPromise
    );

    expect(requestHandler.executeHttp).toHaveBeenCalledWith(
      HttpClient.request.post(
        `https://api.telegram.org/bot${config.botToken}/getUpdates`, {
        body: HttpClient.body.unsafeJson({ limit: 123 }),
      })
    );

  });

});
