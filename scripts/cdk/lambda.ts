import { ENV_KEYS } from "#/const";
import {
  aws_lambda,
  Duration,
  Stack,
  Size,
  aws_iam,
} from "aws-cdk-lib";

import * as bot_config from "../../config.json"

type Deps = {
  stack: Stack,
}

export const createFunctions = ({
  stack
}: Deps) => {

  const iamPerm =
    new aws_iam.PolicyStatement({
      actions: [
        "ssm:GetParameter",
      ],
      resources: ["*"]
    });

  const bff =
    new aws_lambda.Function(stack, "bff-fn", {
      runtime: aws_lambda.Runtime.NODEJS_LATEST,
      handler: "bff.handler",
      code: aws_lambda.Code.fromAsset("dist"),
      timeout: Duration.seconds(10),
      memorySize: Size.mebibytes(512).toMebibytes(),
      architecture: aws_lambda.Architecture.ARM_64
    });

  const bot =
    new aws_lambda.Function(stack, "bot-handler", {
      runtime: aws_lambda.Runtime.NODEJS_LATEST,
      handler: "bot.handler",
      code: aws_lambda.Code.fromAsset("dist"),
      timeout: Duration.seconds(30),
      memorySize: Size.mebibytes(256).toMebibytes(),
      architecture: aws_lambda.Architecture.ARM_64,
      environment: {
        [ ENV_KEYS.botToken ]: bot_config.bot_token,
        [ ENV_KEYS.timeoutInSeconds ]: "30",
      }
    });

  bff.addToRolePolicy(iamPerm);

  return {
    bff, bot
  }

}