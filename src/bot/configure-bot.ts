import { Effect } from "effect";
import { BotService } from "./client";

export const configureTgBot =
  Effect.fn("configure bot")(function* () {

    const botService = yield* BotService;

    yield* Effect.logInfo("Setting up bot's commands");

    yield* setupCommands(botService);

  });


const setupCommands = (
  botService: BotService
) =>
  Effect.tryPromise(() =>
    botService.client.execute("set_my_commands", {
      commands: [
        {
          command: "/echo",
          description: "Replies with the sent message in JSON format"
        },
        {
          command: "/typescript",
          description: "Displays a key advantage of using TypeScript"
        },
        {
          command: "/help",
          description: "Provides information about this bot"
        },
        {
          command: "/start",
          description: "Replies with a greeting"
        },
        {
          command: "/random",
          description: "Sends an animated message with a random outcome"
        }
      ]
    })
  )