import { Effect } from "effect";
import { execute } from "@effect-ak/tg-bot-client";

export const setupCommands = 
  Effect.fn("setup bot commands")(() =>
    execute("set_my_commands", {
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
  );
