import { CacheStrategy, type ReadArgs, staticFile } from "dashi";

/**
 * GET handler for hashed CSS at `/generated/:file`.
 *
 * @param root App root directory containing `generated/`.
 * @see https://dashi.run/docs/styling#generatedfile
 */
export function generatedFile(
  root: string,
): (args: ReadArgs) => Promise<Response> {
  const generatedDir = `${root}/generated`;
  return ({ ctx }) =>
    staticFile(ctx, generatedDir, ctx.params.file, {
      strategy: CacheStrategy.Immutable,
    });
}
