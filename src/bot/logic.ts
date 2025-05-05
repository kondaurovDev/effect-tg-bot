import { MESSAGE_EFFECTS } from "@effect-ak/tg-bot-client";
import { BotResponse, defineBot } from "@effect-ak/tg-bot-client/bot";
import { getRandomTsFact } from "./utils";

export const botLogic = defineBot({
  on_message: (message) => {

    if (!message.text) {
      console.info("non text message", message);
      return BotResponse.ignore;
    }

    if (message.text == "/start") {
      return BotResponse.make({
        type: "message",
        text: `
          Hello, ${message.from?.first_name}. I am Buddy ☺️
        `,
        message_effect_id: MESSAGE_EFFECTS["🔥"]
      })
    }

    if (message.text == "/help") {
      return BotResponse.make({
        type: "message",
        text: `You can find my code on GitHub.`,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "GitHub",
                url: "https://github.com/kondaurovDev/effect-tg-bot"
              }
            ]
          ]
        },
        message_effect_id: MESSAGE_EFFECTS["🔥"]
      })
    }

    if (message.text == "/random") {
      return BotResponse.make({
        type: "dice",
        emoji: "⚽"
      });
    }

    if (message.text == "/echo") {
      return BotResponse.make({
        type: "message",
        parse_mode: "HTML",
        text: `
          <pre language="json">${JSON.stringify(message, undefined, 2)}</pre>
        `
      });
    }

    if (message.text == "/typescript") {
      const fact = getRandomTsFact();
      return BotResponse.make({
        type: "message",
        parse_mode: "HTML",
        text: `
          <b>Typescript: ${fact.title}</b>
          <blockquote>${fact.description}</blockquote>
        `
      })
    }

    if (message.text == "/pay") {
      return BotResponse.make({
        type: "invoice",
        currency: "XTR",
        description: "test payment",
        payload: "payload",
        prices: [
          { label: "test", amount: 1 },
        ],
        title: "test",
        provider_token: ""
      })
    }

    if (message.text) {
      return BotResponse.make({
        type: "message",
        reply_parameters: {
          message_id: message.message_id
        },
        text: "I don't know how to reply on that message",
        message_effect_id: MESSAGE_EFFECTS["💩"]
      });
    }

    return BotResponse.ignore;

  }
})
