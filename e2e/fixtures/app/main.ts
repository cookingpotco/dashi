import { serve } from "dashi";
import { app } from "./mod.ts";
import { errorFallback } from "./errors.tsx";

if (import.meta.main) {
  serve(app, { errorFallback, port: 0 });
}
