// `type` so this satisfies `State extends Record<string, unknown>`.
export type AppState = {
  pre: string;
  embedOnly: string;
  fragOnly: string;
  token: string;
};
