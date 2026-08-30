# Contributing

## Binary assets

This repository uses [Git Large File Storage (Git LFS)](https://git-lfs.com/) for new binary assets. Git LFS stores a small text pointer in Git while the binary content is uploaded separately, so pull requests contain reviewable pointer changes instead of unsupported binary patches.

Before adding a binary asset:

1. Install Git LFS using the instructions for your operating system.
2. Enable it for your account with `git lfs install`.
3. Place the new file under `binary-assets/`. The rule in `.gitattributes` will manage it automatically.
4. Add and commit the asset normally.
5. Run `git lfs ls-files` and confirm the asset is listed before opening a pull request.

Do not modify or replace the legacy binary files in their current locations in a pull request. Instead, add the replacement under `binary-assets/` and update text-based application references in the same commit. This keeps the pull request itself free of unsupported binary patches while preserving the existing deployed assets.
