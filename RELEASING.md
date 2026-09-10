# Releasing

Bump `version` in `deno.json` on `main`. That is the release.

CI boots the README consumer against this checkout. After that run succeeds on
`main`, the Publish workflow publishes with `deno publish`, then boots a fresh
project from the registry. A version already on the registry is skipped, so
every other push to `main` is a no-op and a re-run is safe. There is nothing to
tag.

A published version is immutable. A bad one is answered by bumping again, never
by replacing it.

The package on jsr.io must be linked to this GitHub repository, or OIDC publish
fails.

```sh
deno run -A scripts/verify_fresh_project.ts --linked
deno run -A scripts/verify_fresh_project.ts --registry
```
