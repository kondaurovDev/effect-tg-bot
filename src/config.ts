import { Effect, pipe } from "effect";
import { FileSystem } from "@effect/platform";
import { Schema as S } from "@effect/schema"
import { NodeFileSystem } from "@effect/platform-node";

type ConfigSchema = S.Schema.Type<typeof ConfigSchema>;
const ConfigSchema = S.parseJson(S.struct({
  botToken: S.string.pipe(S.minLength(10)),
}));

export const loadConfigFromFile =
  pipe(
    FileSystem.FileSystem,
    Effect.andThen(fs => pipe(
      fs.readFileString("config.json"),
      Effect.andThen(S.decode(ConfigSchema)),
    )),
    Effect.provide(NodeFileSystem.layer),
  )
