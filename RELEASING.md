# Releasing

Bump `version` in `deno.json` and the README JSR pin to the same version on
`main`. That is the release.

## Breaking changes

When shipping a breaking API change, note it here before bumping:

- **`patch.replace` → `patch.update` (children).** The old `patch.replace`
  replaced a target's children (`innerHTML`). That behavior is now
  `patch.update`. Call sites that meant children replacement must rename.
- **New `patch.replace` (element).** `patch.replace` now swaps the target node
  itself (`replaceWith`), matching Turbo. Re-emit `id` on the replacement node
  when the new element should keep the same `#${string}` target.

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
