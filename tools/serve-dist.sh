#!/bin/bash
cd "$(dirname "$0")/.."
while true; do node tools/serve-dist.mjs >> serve.log 2>&1; sleep 1; done
