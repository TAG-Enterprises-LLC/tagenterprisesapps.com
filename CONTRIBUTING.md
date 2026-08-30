# Contributing

## Pull-request file support

The pull-request service used for this repository accepts text patches but does
not accept binary files. Git LFS does not remove that limitation: it requires a
separate LFS upload and leaves the pull request dependent on an external object.

Keep reusable browser packages, including the T-G-Apps Device Display Optimizer,
as their unpacked source files. Do not commit a ZIP, tarball, generated package,
or LFS pointer for them. Consumers can load the CSS and JavaScript directly from
the package directory.

Before opening a pull request, review the files changed from the base branch:

```sh
git diff --numstat BASE...HEAD
```

A binary change is displayed with `-` in place of the added and removed line
counts. Remove that file from the branch and make the equivalent source-only
change instead. Existing images and WebAssembly files are needed by the deployed
site, but source-only pull requests should not modify them.
