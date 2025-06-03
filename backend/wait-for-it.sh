#!/usr/bin/env bash
#   Use this script to test if a given TCP host/port are available

set -e

TIMEOUT=15
QUIET=0
HOST=""
PORT=""

echoerr() {
  if [ "$QUIET" -ne 1 ]; then
    echo "$@" 1>&2
  fi
}

usage() {
  cat << USAGE >&2
Usage:
  $0 host:port [-- command args]
  -q | --quiet                        Do not output any status messages
  -t TIMEOUT | --timeout=TIMEOUT     Timeout in seconds, zero for no timeout
USAGE
  exit 1
}

wait_for() {
  for i in $(seq $TIMEOUT); do
    nc -z "$HOST" "$PORT" >/dev/null 2>&1
    result=$?
    if [ $result -eq 0 ]; then
      return 0
    fi
    sleep 1
  done
  return 1
}

while [ $# -gt 0 ]; do
  case "$1" in
    *:* )
    HOSTPORT=(${1//:/ })
    HOST=${HOSTPORT[0]}
    PORT=${HOSTPORT[1]}
    shift
    ;;
    -q | --quiet)
    QUIET=1
    shift
    ;;
    -t)
    TIMEOUT="$2"
    shift 2
    ;;
    --timeout=*)
    TIMEOUT="${1#*=}"
    shift
    ;;
    --)
    shift
    CMD=("$@")
    break
    ;;
    --help)
    usage
    ;;
    *)
    echoerr "Unknown argument: $1"
    usage
    ;;
  esac
done

if [ "$HOST" = "" ] || [ "$PORT" = "" ]; then
  echoerr "Error: you must provide a host and po
