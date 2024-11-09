import { HttpApi, HttpApiBuilder } from "@effect/platform";
import { Cause, Effect, Layer, pipe } from "effect";
import * as Marked from "marked"

import { ApiEndpoints, PageEndpoints, StaticFilesEndpoints, UnknownError } from "./definition.js";
import { backend } from "../../ai-service.js";
import { UtilService } from "../util.js";

export class BackendApi
  extends HttpApi.empty
    .add(ApiEndpoints)
    .add(PageEndpoints)
    .add(StaticFilesEndpoints) {

  static live =
    HttpApiBuilder.api(BackendApi)
      .pipe(
        Layer.provide(
          HttpApiBuilder.group(BackendApi, "api", handlers =>
            Effect.gen(function* () {

              return handlers
                .handle("ask-ai", ({ urlParams }) =>
                  pipe(
                    Effect.tryPromise(() => backend.askAI(urlParams.question)),
                    Effect.andThen(answer =>
                      Effect.tryPromise(() =>
                        Marked.parse(answer, { async: true })
                      )
                    ),
                    // Effect.tapErrorCause(Effect.logError),
                    Effect.catchAllCause((error) =>
                      Effect.succeed(`<pre class="bg-warning">${Cause.pretty(error, { renderErrorCause: true })}</pre>`)
                    )
                  )
                )
            })
          )
        ),
        Layer.provide(
          HttpApiBuilder.group(BackendApi, "pages", handlers =>
            Effect.gen(function* () {
              return handlers
                .handle("ask-ai", () =>
                  pipe(
                    UtilService,
                    Effect.andThen(_ => 
                      _.readFileFromProjectRoot([ "src", "html", "ask-ai.html"])
                    ),
                    Effect.catchAll(() =>
                      Effect.fail(new UnknownError())
                    )
                  )
                )
            })
          )
        ),
        Layer.provide(
          HttpApiBuilder.group(BackendApi, "static", handlers =>
            Effect.gen(function* () {

              return handlers
                .handle("css", ({ path }) =>
                  pipe(
                    UtilService,
                    Effect.andThen(_ => 
                      _.readFileFromNodeModules([ ...path.path ])
                    ),
                    Effect.catchAll(() =>
                      Effect.fail(new UnknownError())
                    )
                  )
                )
                .handle("js", ({ path }) =>
                  pipe(
                    UtilService,
                    Effect.andThen(_ => 
                      _.readFileFromNodeModules([ ...path.path ])
                    ),
                    Effect.catchAll(() =>
                      Effect.fail(new UnknownError())
                    )
                  )
                )
            })
          )
        ),
        
      )
}
