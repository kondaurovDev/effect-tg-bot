import { pipe } from "effect/Function";
import * as Effect from "effect/Effect";
import { readFile } from "node:fs/promises";

export const readFileEffect = (
  path: string
) =>
  pipe(
    Effect.succeed(__dirname + `/../../node_modules/${path}`),
    Effect.tap(_ => Effect.logInfo("reading file", _)),
    Effect.andThen(file =>
      Effect.tryPromise(() => readFile(file))
    ),
    Effect.andThen(_ => _.toString("utf-8")),
    Effect.catchAll(() => Effect.succeed(""))
  );
