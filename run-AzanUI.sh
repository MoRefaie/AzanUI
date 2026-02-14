#!/bin/bash

# Resolve the directory of this script (AzanUI folder)
DIR="$(cd "$(dirname "$0")" && pwd)"

# Path to portable Node runtime
NODE="$DIR/node/bin/node"

# Path to UI server
SERVER="$DIR/server.js"

# Start UI
exec "$NODE" "$SERVER"
