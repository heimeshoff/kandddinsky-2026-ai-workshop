#!/usr/bin/env bash
# Blocks until a task file in tasks/todo/ is created or edited, then exits 0.
# Exits 2 after ~55 minutes without a change so the caller can just wait again.
cd "$(dirname "$0")/../../.." || exit 1
marker="$(mktemp)"
for _ in $(seq 1 220); do
  sleep 15
  if [ -n "$(find tasks/todo -name '*.md' -newer "$marker" 2>/dev/null)" ]; then
    rm -f "$marker"
    echo "tasks/todo changed"
    exit 0
  fi
done
rm -f "$marker"
echo "no change"
exit 2
