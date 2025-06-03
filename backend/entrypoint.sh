#!/bin/bash
set -e

echo "Starting backend — waiting for database..."

/wait-for-it.sh db:5432 --timeout=30 -- python app.py
