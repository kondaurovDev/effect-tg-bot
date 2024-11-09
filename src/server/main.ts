import { HttpApiBuilder, HttpMiddleware, HttpServer } from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { ConfigProvider, Layer } from "effect"
import { createServer } from "node:http"
import { setConfigProvider } from "effect/Layer"
import { LogLevelConfigFromEnv } from "@effect-ak/misc"

import jsonConfig from "../../config.json"
import { BackendApi } from "./api/implementation.js"
import { initBackend } from "../ai-service"
import { UtilService } from "./util"

process.env["LOG_LEVEL"] = "debug"

const nodeHttpServer = (
  port: number
) =>
  NodeHttpServer.layer(createServer, { port });

const configProvider =
  ConfigProvider.fromJson({
    vueComponentsDir: __dirname + "/../pages",
    vueComponentsOutDir: __dirname + "/../.out",
    "effect-ak-ai": {
      "openai-token": jsonConfig["effect-ak-ai"]["openai-token"],
    },
    LOG_LEVEL: "debug"
  })

const configProviderLayer = 
  setConfigProvider(configProvider)

initBackend(configProvider)

const HttpLive =
  HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
    Layer.provide(HttpApiBuilder.middlewareCors()),
    Layer.provide(BackendApi.live),
    Layer.provide(LogLevelConfigFromEnv),
    Layer.provide(UtilService.Default),
    HttpServer.withLogAddress,
    Layer.provide(nodeHttpServer(3000))
  ).pipe(
    Layer.provide(configProviderLayer)
  )

Layer.launch(HttpLive).pipe(NodeRuntime.runMain)
