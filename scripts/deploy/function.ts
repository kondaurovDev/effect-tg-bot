import { Data, Effect, Equal, pipe, Schedule } from "effect";

import { iam } from "#sdk-clients/iam";
import { lambda } from "#sdk-clients/lambda";
import { FileSystem } from "@effect/platform";
import { getFunctionUrl } from "./configure-bot";

export const REGION = "eu-west-1";

const ROLE_NAME = "tg-bot-buddy";

type UpsertFunctionInput = {
  functionName: string
  handler: string
  description: string
  timeout: number
  enableUrl: boolean
  iamRole: string
  env: Record<string, string>
  queueEventSource?: string
};

export const upsertFunction = (
  { functionName, handler, timeout, iamRole, enableUrl, queueEventSource, env, description }: UpsertFunctionInput
) =>
  Effect.gen(function* () {

    const fs = yield* FileSystem.FileSystem;

    const fn =
      yield* lambda("get_function", {
        FunctionName: functionName
      }).pipe(
        Effect.catchIf(_ => _.$is("ResourceNotFoundException"), () => Effect.void)
      );

    const code = yield* fs.readFile("lambda.zip");

    if (!fn) {
      yield* lambda("create_function", {
        FunctionName: functionName,
        Runtime: "nodejs22.x",
        Architectures: ["arm64"],
        Description: description,
        Handler: handler,
        Timeout: timeout,
        Role: iamRole,
        Environment: {
          Variables: env
        },
        Code: {
          ZipFile: code
        }
      });
      return true;
    }

    const isEnvChanged =
      fn.Configuration?.Environment?.Variables == null || !Equal.equals(Data.struct(fn.Configuration?.Environment?.Variables))(Data.struct(env))

    const isConfigurationChanged =
      fn.Configuration?.Handler != handler || fn.Configuration.Timeout != timeout || fn.Configuration.Description != description;

    if (isEnvChanged || isConfigurationChanged) {
      yield* lambda("update_function_configuration", {
        FunctionName: functionName,
        Handler: handler,
        Timeout: timeout,
        Description: description,
        Environment: {
          Variables: env
        }
      });
    };

    yield* lambda("update_function_code", {
      FunctionName: functionName,
      ZipFile: code
    }).pipe(
      Effect.tapError(Effect.logError),
      Effect.retry({
        schedule: Schedule.exponential("10 seconds"),
        times: 3,
        while: _ => _.$is("ResourceConflictException"),
      })
    );

    if (enableUrl) {

      const fnPolicy =
        yield* lambda("get_policy", {
          FunctionName: functionName
        }).pipe(
          Effect.catchIf(_ => _.$is("ResourceNotFoundException"), () => Effect.void)
        );

      const urlConfig =
        yield* getFunctionUrl(functionName);

      if (!urlConfig) {
        yield* lambda("create_function_url_config", {
          FunctionName: functionName,
          AuthType: "NONE"
        }).pipe(
          Effect.merge
        );
      };

      if (!fnPolicy?.Policy) {
        yield* lambda("add_permission", {
          FunctionName: functionName,
          StatementId: "AllowInvokeFromAnywhere",
          Action: "lambda:InvokeFunctionUrl",
          Principal: "*",
          FunctionUrlAuthType: "NONE",
        }).pipe(
          Effect.merge
        );
      }

    };

    if (queueEventSource) {

      yield* lambda("create_event_source_mapping", {
        FunctionName: functionName,
        EventSourceArn: queueEventSource,
        ScalingConfig: {
          MaximumConcurrency: 2,
        },
        BatchSize: 100,
        MaximumBatchingWindowInSeconds: 60
      }).pipe(
        Effect.catchIf(_ => _.$is("ResourceConflictException"), () => Effect.void)
      );

    }

  });

export const getIamFunctionRole =
  pipe(
    iam("get_role", {
      RoleName: ROLE_NAME
    }),
    Effect.andThen(_ => _.Role?.Arn),
    Effect.catchIf(_ => _.$is("NoSuchEntityException"), () =>
      iam("create_role", {
        RoleName: ROLE_NAME,
        AssumeRolePolicyDocument:
          JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
              Effect: "Allow",
              Principal: { Service: "lambda.amazonaws.com" },
              Action: "sts:AssumeRole"
            }]
          })
      }).pipe(
        Effect.tap(
          iam("put_role_policy", {
            RoleName: ROLE_NAME,
            PolicyName: "default",
            PolicyDocument: JSON.stringify({
              Version: "2012-10-17",
              Statement: [{
                Effect: "Allow",
                Action: [
                  "logs:CreateLogGroup",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents"
                ],
                Resource: `arn:aws:logs:${REGION}:*`
              }]
            }),
          })
        ),
        Effect.andThen(_ => _.Role?.Arn),
      ),
    ),
    Effect.andThen(Effect.fromNullable)
  );
