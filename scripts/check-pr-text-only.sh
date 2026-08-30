#!/usr/bin/env bash

set -euo pipefail

base=${1:-HEAD^}
binary_files=()

while IFS= read -r -d '' entry; do
  additions=${entry%%$'\t'*}
  remainder=${entry#*$'\t'}
  deletions=${remainder%%$'\t'*}
  path=${remainder#*$'\t'}

  if [[ $additions == - || $deletions == - ]]; then
    binary_files+=("$path")
  fi
# Compare the base directly with the current working tree. Unlike a
# base...HEAD comparison, this also examines staged and unstaged changes, so
# the required pre-commit invocation can catch a binary before it is committed.
done < <(git diff --no-renames --numstat -z "$base" --)

if ((${#binary_files[@]})); then
  printf 'Pull request contains unsupported binary changes:\n' >&2
  printf '  %s\n' "${binary_files[@]}" >&2
  printf 'Restore these files to their state at %s and commit source-only changes instead.\n' "$base" >&2
  exit 1
fi

printf 'OK: changes since %s contain text changes only.\n' "$base"
