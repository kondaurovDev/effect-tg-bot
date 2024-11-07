import { AiMainService } from "@effect-ak/ai";
import { Effect, type ConfigProvider } from "effect";

type Backend = {
  askAI: (question: string) => Promise<string>
}

export const backend: Backend = {
  askAI() {
    return Promise.resolve(`AI isn't connected`)
  },
};

export const initBackend = (config: ConfigProvider.ConfigProvider) => {
  console.log("Initializing backend...")
  backend.askAI = (question) =>
    Effect.gen(function* () {

      const ai = yield* AiMainService;

      const response =
        yield* ai.openai.completeChat({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
                you are very experienced developer
                you are limited in words when answering to user (30 words maximum)
              `
            },
            {
              role: "user",
              content: question
            }
          ]
        });

      return response;

    }).pipe(
      Effect.withConfigProvider(config),
      Effect.provide(AiMainService.Default),
      Effect.runPromise
    );

  Object.freeze(backend)
}

