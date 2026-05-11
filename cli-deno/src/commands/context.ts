import { getContext } from "../shared/utils.ts";
import { CommandContext } from "../shared/types.ts";

const debugEnabled = Deno.env.get("DEBUG") === "1" ||
  Deno.env.get("DEBUG") === "true" ||
  Deno.env.get("DEBUG") === "*";

export const makeContext = (verbose = false): Promise<CommandContext> =>
  getContext(
    (...args) => console.log(...args),
    (msg) => console.warn(`warn: ${msg}`),
    (msg) => {
      console.error(`error: ${msg}`);
      Deno.exit(1);
    },
    (...args) => {
      if (debugEnabled || verbose) console.error("[debug]", ...args);
    }
  );
