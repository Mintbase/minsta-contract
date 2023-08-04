#!/bin/sh

echo ">> Building contract"

npx near-sdk-js build src/contract.ts build/hello_near.wasm
