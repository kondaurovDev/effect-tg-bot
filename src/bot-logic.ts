import { MessageHandler } from "@effect-ak/tg-bot";

import { backend } from "./ai-service";

export const messageHandler: MessageHandler =
  async ({ message, currentChatId, service }) => {

    await service.chat.setChatAction({
      action: "typing",
      chat_id: currentChatId
    }).promise()

    if (message.text == null) {
      return service.chat.sendMessage({
        chat_id: currentChatId,
        text: "I got your non-text message!",
        reply_parameters: {
          chat_id: currentChatId,
          message_id: message.message_id
        }
      });
    }

    if (message.text == "/random") {
      return service.chat.sendDice({
        chat_id: currentChatId,
        emoji: "🏀"
      });
    }

    if (message.text == "/fact") {
      console.log("asked fact")
      const fact = await backend.askAI("tell me an interesting and practical information about typescript")
      return service.chat.sendMessage({
        chat_id: currentChatId,
        text: fact
      });
    }

    if (message.text == "/start") {
      const botInfo =
        await service.botSettings.getMe.promise();

      return service.chat.sendMessage({
        chat_id: currentChatId,
        text: `Hello, ${message.from?.first_name}. My name is ${botInfo.first_name}. Let's talk! :)`,
        message_effect_id: "🔥"
      });
    }

    if (message.text == "/pay") {
      return service.payment.sendStarsInvoice({
        chat_id: currentChatId,
        currency: "XTR",
        description: "test payment",
        payload: "payload",
        prices: [
          { label: "one", amount: 1 },
          // { label: "two", amount: 2 },
        ],
        title: "test",
        provider_token: ""
      })
    }

    return service.chat.sendMessage({
      chat_id: currentChatId,
      reply_parameters: {
        chat_id: currentChatId,
        message_id: message.message_id
      },
      text: "I don't know how to reply on that",
      message_effect_id: "💩"
    });

  }
