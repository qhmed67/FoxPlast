#!/bin/bash
cd /home/dev/projects/Fox-Plast
while true; do node serve.mjs >> serve.log 2>&1; sleep 1; done
