import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform"
import * as S from "effect/Schema";

export class UnknownError extends S.TaggedError<UnknownError>()(
  "UnknownError",
  {}
) { }

export class ApiEndpoints extends
  HttpApiGroup.make("api")
    .addError(UnknownError, { status: 418 })
    .add(
      HttpApiEndpoint
        .get("ask-ai", "/api/ask-ai")
        .setUrlParams(
          S.Struct({
            question: S.NonEmptyString
          })
        )
        .addSuccess(HttpApiSchema.Text({ contentType: "text/html" }))
    )
{ }

export class PageEndpoints extends
  HttpApiGroup.make("pages")
    .addError(UnknownError, { status: 418 })
    .add(
      HttpApiEndpoint
        .get("ask-ai", "/ask-ai")
        .addSuccess(HttpApiSchema.Text({ contentType: "text/html" }))
    )
{ }

export class StaticFilesEndpoints extends
  HttpApiGroup.make("static")
    .addError(UnknownError, { status: 418 })
    .add(
      HttpApiEndpoint
        .get("css", "/css/:path")
        .setPath(
          S.Struct({
            path: S.split(":")
          })
        )
        .addSuccess(HttpApiSchema.Text({ contentType: "text/css" }))
    )
    .add(
      HttpApiEndpoint
        .get("js", "/js/:path")
        .setPath(
          S.Struct({
            path: S.split(":")
          })
        )
        .addSuccess(HttpApiSchema.Text({ contentType: "text/javascript" }))
    )
{ }

