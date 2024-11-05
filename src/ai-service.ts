import { Openai } from "@effect-ak/ai/vendor";
import { Effect, pipe } from "effect";

export const askAI = (
  question: string
) =>
  pipe(
    Openai.Text.TextService,
    Effect.andThen(openai =>
      openai.complete({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
              you are very experience developer
              you are limited in words when answering to user (30 words maximum)
            `
          },
          {
            role: "user",
            content: question
          }
        ]
      })
    ),
    Effect.provide(Openai.Text.TextService.Default),
    Effect.runPromise
  )
