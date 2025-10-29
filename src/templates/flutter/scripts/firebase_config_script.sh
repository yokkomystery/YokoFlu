#!/bin/bash

set -e

resolve_environment() {
    local environment_from_defines

    environment_from_defines="$(python3 <<'PY'
import base64
import os

dart_defines = os.environ.get("DART_DEFINES", "")
environment = ""

for entry in filter(None, dart_defines.split(",")):
    try:
        decoded = base64.b64decode(entry).decode("utf-8")
    except Exception:
        continue

    if decoded.startswith("ENVIRONMENT="):
        environment = decoded.split("=", 1)[1]
        break

print(environment)
PY
)"

    if [ -n "${environment_from_defines}" ]; then
        echo "${environment_from_defines}"
        return
    fi

    # DART_DEFINESが無い場合はXcode設定から判定
    case "${CONFIGURATION}" in
        Release*)
            echo "production"
            ;;
        *)
            echo "staging"
            ;;
    esac
}

copy_config() {
    local source_file="$1"
    local destination_file="$2"

    if [ ! -f "${source_file}" ]; then
        echo "⚠️  Firebase config file not found: ${source_file}"
        return 1
    fi

    cp "${source_file}" "${destination_file}"
}

ENVIRONMENT_VALUE=$(resolve_environment)
DESTINATION="${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/GoogleService-Info.plist"

case "${ENVIRONMENT_VALUE}" in
    staging)
        echo "Using staging Firebase configuration"
        copy_config "${SRCROOT}/Runner/GoogleService-Info-staging.plist" "${DESTINATION}"
        ;;
    production)
        echo "Using production Firebase configuration"
        copy_config "${SRCROOT}/Runner/GoogleService-Info-production.plist" "${DESTINATION}"
        ;;
    *)
        echo "Unknown environment (${ENVIRONMENT_VALUE}), falling back to production configuration"
        copy_config "${SRCROOT}/Runner/GoogleService-Info-production.plist" "${DESTINATION}"
        ;;
esac

echo "Firebase configuration copied for environment: ${ENVIRONMENT_VALUE} (CONFIGURATION=${CONFIGURATION})"
