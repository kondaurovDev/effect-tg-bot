import { Effect } from "effect";
import { makeTgBotClient } from "@effect-ak/tg-bot-client";
import { ssm } from "#/aws-clients/ssm";

export class BotService
  extends Effect.Service<BotService>()("BotService", {
    effect:
      Effect.gen(function* () {

        const { token } =
          yield* getBotConfig();

        const client =
          makeTgBotClient({
            bot_token: token
          });

        return {
          token,
          client,
        }

      })
  }) { }

const getParameter = (
  key: string
) =>
  ssm("get_parameter", {
    Name: key,
    WithDecryption: true
  }).pipe(
    Effect.andThen(_ => _.Parameter?.Value),
    Effect.filterOrFail(_ => _ != null, () => Effect.fail("Parameter isn't defined"))
  )

const getBotConfig =
  Effect.fn("get bot token from ssm")(function* () {

    const token = yield* getParameter("buddy-tg-bot-token");

    return { token };

  });
