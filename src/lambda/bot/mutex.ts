import { Config, DateTime, Effect } from "effect"
import { s3 } from "#sdk-clients/s3"
import { CONSTANT, ENV_KEYS } from "#/const";

const BucketName = Config.nonEmptyString(ENV_KEYS.lockBucket);

export const lock =
  Effect.gen(function* () {

    const bucketName = yield* BucketName;

    const now = yield* DateTime.now;

    yield* s3("put_object", {
      Bucket: bucketName,
      IfNoneMatch: "*",
      Key: CONSTANT.lockFileName,
      Body: JSON.stringify({
        start_time: now.toString(),
        start_time_ms: now.pipe(DateTime.toEpochMillis)
      })
    });

    return true;

  }).pipe(
    Effect.catchIf(
      e => e._tag == "S3Error" && e.cause.$metadata.httpStatusCode == 409,
      () => Effect.succeed(false)
    ),
  );

export const unlock =
  Effect.gen(function* () {

    const bucketName = yield* BucketName;

    yield* s3("delete_object", {
      Bucket: bucketName,
      Key: CONSTANT.lockFileName,
    });

    return true;

  }).pipe(
    Effect.catchIf(e => e._tag == "S3Error" && e.is("NoSuchKey"), () => Effect.succeed(false)),
    Effect.tap(result => Effect.logInfo("unlocked", result)),
  );
