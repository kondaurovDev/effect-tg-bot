import { pipe } from "effect/Function";
import { FileSystem } from "@effect/platform/FileSystem";
import { Path } from "@effect/platform/Path";
import * as Effect from "effect/Effect";
import { NodeContext } from "@effect/platform-node";

export class UtilService extends Effect.Service<UtilService>()("UtilService", {
  effect:
    Effect.gen(function* () {

      const fsService = yield* FileSystem;
      const pathService = yield* Path;
      const rootPath = [__dirname, "..", ".."];

      const readFileFromProjectRoot = (
        path: string[]
      ) =>
        pipe(
          Effect.succeed(pathService.join(...rootPath, ...path)),
          Effect.tap(_ => Effect.logInfo("reading file", _)),
          Effect.andThen(fsService.readFileString),
          Effect.catchAll(() => Effect.succeed(""))
        );

      const readFileFromNodeModules = (
        path: string[]
      ) =>
        readFileFromProjectRoot(
          ["node_modules", ...path]
        )

      return {
        readFileFromProjectRoot,
        readFileFromNodeModules
      } as const;

    }),

    dependencies: [
      NodeContext.layer
    ]
}) { }


