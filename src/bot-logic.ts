import { MESSAGE_EFFECTS, runTgChatBot } from "@effect-ak/tg-bot-client"

import { getRandomTsFact } from "./helper";

runTgChatBot({
  type: "fromJsonFile",
  on_message: (message) => {

    if (!message.text) {
      console.info("non text message", message)
      return;
    }

    if (message.text == "/random") {
      return {
        type: "dice",
        emoji: "🏀"
      };
    }

    if (message.text == "/echo") {
      return {
        type: "message",
        parse_mode: "HTML",
        text: `
          <pre language="json">${JSON.stringify(message, undefined, 2)}</pre>
        `
      };
    }

    if (message.text == "/typescript") {
      const fact = getRandomTsFact();
      return {
        type: "message",
        parse_mode: "HTML",
        text: `
          <b>Typescript: ${fact.title}</b>
          <blockquote>${fact.description}</blockquote>
        `
      }
    }

    if (message.text == "/start") {
      return {
        type: "message",
        text: `Hello, ${message.from?.first_name}. My name is Buddy. Let's talk! :)`,
        message_effect_id: MESSAGE_EFFECTS["🔥"]
      }
    }

    if (message.text == "/pay") {
      return {
        type: "invoice",
        currency: "XTR",
        description: "test payment",
        payload: "payload",
        prices: [
          { label: "one", amount: 1 },
          // { label: "two", amount: 2 },
        ],
        title: "test",
        provider_token: ""
      }
    }

    if (message.text) {
      return {
        type: "message",
        reply_parameters: {
          message_id: message.message_id
        },
        text: "I don't know how to reply on that message",
        message_effect_id: MESSAGE_EFFECTS["💩"]
      };
    }

  }
})
