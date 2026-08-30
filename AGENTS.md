# Repository instructions

## Pull-request compatibility

The Codex pull-request service for this repository rejects **every binary
change**, including an edit to an already tracked binary file. Before editing,
inspect the requested files and keep the complete branch diff text-only.

- Do not add, replace, delete, rename, regenerate, optimize, or otherwise touch
  images, audio, videos, fonts, archives, WebAssembly, or other binary files.
- In particular, do not replace the favicon, app logo, launcher icon, phone
  icon, PWA icon, screenshots, or files below any `assets/images` directory.
- A user-supplied image may be used as a visual reference, but must not be
  copied into the repository. If a request asks for an image replacement,
  retain the existing binary asset and complete only the text/source portions
  of the request. Explain this constraint in the final response.
- Do not use Git LFS or a base64/text wrapper to work around the restriction.
- Reuse existing asset paths from HTML, CSS, JavaScript, JSON, or manifests
  without modifying the referenced binary files.

Immediately before committing and again before creating a pull request, run:

```sh
scripts/check-pr-text-only.sh HEAD^
```

Before the pre-commit check, stage every intended change (including new files)
with `git add`. Git cannot inspect untracked files until they are staged. The
check compares the supplied base with the current working tree, so it covers
committed, staged, and unstaged changes together.

When the task spans multiple commits, replace `HEAD^` with the actual base
commit. If the check reports a binary path, restore that path from the base and
commit only the source changes. Never create a pull request until the check
passes.
