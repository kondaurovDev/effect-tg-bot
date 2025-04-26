import {
  aws_apigatewayv2, aws_apigatewayv2_integrations,
  Stack, aws_lambda
} from "aws-cdk-lib";

type Deps = {
  stack: Stack
  bff_fn: aws_lambda.Function
}

export const createHttpApi = ({
  stack, bff_fn
}: Deps) => {

  const httpApi =
    new aws_apigatewayv2.HttpApi(stack, "http-gw", {
      apiName: "tg-bot-demo",
      createDefaultStage: true
    });

  const bffIntegration =
    new aws_apigatewayv2_integrations.HttpLambdaIntegration("bff-int", bff_fn);

  httpApi.addRoutes({
    path: "/api/{proxy+}",
    integration: bffIntegration,
  })

  return { httpApi }

}

