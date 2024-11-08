import { Context, Effect, ManagedRuntime, pipe } from "effect"

class MyService extends Effect.Service<MyService>()("MyService", {
  succeed: () => (arg: string) => "method " + arg
}) {}

const myRuntime = ManagedRuntime.make(MyService.Default);

const runtime = 
  await pipe(
    myRuntime,
    Effect.runPromise
  );

const myServiceInstance = 
pipe(
  runtime.context,
  Context.get(MyService),
)

myServiceInstance