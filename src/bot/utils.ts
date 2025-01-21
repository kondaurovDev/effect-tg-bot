import * as Random from "effect/Random";
import * as Effect from "effect/Effect";

import * as tsFacts from "./facts.json"

export const getRandomTsFact = () => 
  Random.choice(tsFacts.facts).pipe(Effect.runSync)
