import {
  Stack, App,
} from "aws-cdk-lib";
import { createFunctions } from "./lambda";
import { createHttpApi } from "./http";

const app = new App({});
const stack = new Stack(app, 'TgBotDemo', {
  env: {
    region: "eu-central-1"
  }
});

const { bff } = createFunctions({ stack });

const { httpApi } = createHttpApi({ stack, bff_fn: bff });

