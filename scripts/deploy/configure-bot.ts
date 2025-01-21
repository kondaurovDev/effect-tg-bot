import { Effect } from "effect";
import { lambda } from "#sdk-clients/lambda";
import { BotService } from "./bot-service";

export const getFunctionUrl = (
  functionName: string
) =>
  lambda("get_function_url_config", {
    FunctionName: functionName
  }).pipe(
    Effect.catchIf(_ => _.$is("ResourceNotFoundException"), () => Effect.void)
  );

export const configureTgBot =
  Effect.gen(function* () {

    const botService = yield* BotService;

    const bffFunctionUrl =
      yield* getFunctionUrl("buddy-bot-bff").pipe(
        Effect.andThen(_ => _?.FunctionUrl),
        Effect.filterOrFail(_ => _ != null)
      );

    yield* Effect.tryPromise(() =>
      botService.client.execute("set_chat_menu_button", {
        menu_button: {
          type: "web_app",
          text: "wake up",
          web_app: {
            url: bffFunctionUrl
          }
        }
      })
    );

    yield* Effect.tryPromise(() =>
      botService.client.execute("set_my_commands", {
        commands: [
          {
            command: "/echo",
            description: "Replies with the sent message in JSON format"
          },
          {
            command: "/typescript",
            description: "Displays a key advantage of using TypeScript"
          }
        ]
      })
    );

  })