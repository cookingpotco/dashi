# Releasing

Bump `version` in `deno.json` on `main`. That is the release.

CI publishes with `deno publish` after the existing checks. A version already on
the registry is skipped, so every other push to `main` is a no-op and a re-run
is safe. There is nothing to tag.

A published version is immutable. A bad one is answered by bumping again, never
by replacing it.

`verify-release` runs after publish against the registry. A failure there means
fix and bump.

The package on jsr.io must be linked to this GitHub repository, or OIDC publish
fails.

```sh
deno run -A scripts/verify_fresh_project.ts --linked
deno run -A scripts/verify_fresh_project.ts --registry
```
