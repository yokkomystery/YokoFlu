#!/bin/bash

set -e

echo "========================================"
echo "Firebase Config Script - Debug Info"
echo "========================================"
echo "CONFIGURATION: ${CONFIGURATION}"
echo "SRCROOT: ${SRCROOT}"
echo "BUILT_PRODUCTS_DIR: ${BUILT_PRODUCTS_DIR}"
echo "PRODUCT_NAME: ${PRODUCT_NAME}"
echo "DART_DEFINES: ${DART_DEFINES}"
echo "========================================"

resolve_environment() {
    local environment_from_defines

    environment_from_defines="$(python3 <<'PY'
import base64
import os
import sys

dart_defines = os.environ.get("DART_DEFINES", "")
environment = ""

if dart_defines:
    print(f"DEBUG: DART_DEFINES found: {dart_defines[:100]}...", file=sys.stderr, flush=True)
    for entry in filter(None, dart_defines.split(",")):
        try:
            decoded = base64.b64decode(entry).decode("utf-8")
            print(f"DEBUG: Decoded entry: {decoded}", file=sys.stderr, flush=True)
            if decoded.startswith("ENVIRONMENT="):
                environment = decoded.split("=", 1)[1]
                print(f"DEBUG: Found ENVIRONMENT={environment}", file=sys.stderr, flush=True)
                break
        except Exception as e:
            print(f"DEBUG: Failed to decode entry: {e}", file=sys.stderr, flush=True)
            continue
else:
    print("DEBUG: No DART_DEFINES found", file=sys.stderr, flush=True)

print(environment, flush=True)
PY
)"

    echo "DEBUG: environment_from_defines='${environment_from_defines}'" >&2

    if [ -n "${environment_from_defines}" ]; then
        echo "DEBUG: Using environment from DART_DEFINES: ${environment_from_defines}" >&2
        echo "${environment_from_defines}"
        return
    fi

    # DART_DEFINESが無い場合はXcode設定から判定
    echo "DEBUG: No DART_DEFINES, using CONFIGURATION: ${CONFIGURATION}" >&2
    case "${CONFIGURATION}" in
        *Release*)
            echo "DEBUG: CONFIGURATION contains 'Release', using production" >&2
            echo "production"
            ;;
        *Production*)
            echo "DEBUG: CONFIGURATION contains 'Production', using production" >&2
            echo "production"
            ;;
        *)
            echo "DEBUG: Default case, using staging" >&2
            echo "staging"
            ;;
    esac
}

copy_config() {
    local source_file="$1"
    local destination_file="$2"

    echo "DEBUG: Attempting to copy from: ${source_file}"
    echo "DEBUG: Destination: ${destination_file}"

    if [ ! -f "${source_file}" ]; then
        echo "⚠️  Firebase config file not found: ${source_file}"
        echo "DEBUG: Available files in Runner directory:"
        ls -la "${SRCROOT}/Runner/" | grep -i "googleservice" || echo "No GoogleService files found"
        return 1
    fi

    cp "${source_file}" "${destination_file}"
    echo "✅ Successfully copied config file"
}

ENVIRONMENT_VALUE=$(resolve_environment)
DESTINATION="${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/GoogleService-Info.plist"

echo "========================================"
echo "Resolved ENVIRONMENT: ${ENVIRONMENT_VALUE}"
echo "========================================"

case "${ENVIRONMENT_VALUE}" in
    staging)
        echo "📱 Using staging Firebase configuration"
        copy_config "${SRCROOT}/Runner/GoogleService-Info-staging.plist" "${DESTINATION}"
        ;;
    production)
        echo "🏭 Using production Firebase configuration"
        copy_config "${SRCROOT}/Runner/GoogleService-Info-production.plist" "${DESTINATION}"
        ;;
    *)
        echo "⚠️  Unknown environment (${ENVIRONMENT_VALUE}), falling back to production configuration"
        copy_config "${SRCROOT}/Runner/GoogleService-Info-production.plist" "${DESTINATION}"
        ;;
esac

echo "========================================"
echo "✅ Firebase configuration completed"
echo "Environment: ${ENVIRONMENT_VALUE}"
echo "Configuration: ${CONFIGURATION}"
echo "========================================"
