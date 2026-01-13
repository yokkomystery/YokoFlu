#!/bin/bash

set -e

echo "========================================"
echo "Firebase Config Script - Debug Info"
echo "========================================"
echo "CONFIGURATION: ${CONFIGURATION}"
echo "SRCROOT: ${SRCROOT}"
echo "BUILT_PRODUCTS_DIR: ${BUILT_PRODUCTS_DIR}"
echo "PRODUCT_NAME: ${PRODUCT_NAME}"
echo "DART_DEFINES (env): ${DART_DEFINES}"
echo "DART_DEFINES length (env): ${#DART_DEFINES}"
if [ -n "${DART_DEFINES}" ]; then
    echo "DART_DEFINES first 200 chars (env): ${DART_DEFINES:0:200}"
fi
GENERATED_XCCONFIG="${SRCROOT}/../Flutter/Generated.xcconfig"
if [ -f "${GENERATED_XCCONFIG}" ]; then
    GENERATED_DART_DEFINES=$(grep "^DART_DEFINES=" "${GENERATED_XCCONFIG}" | cut -d'=' -f2- | tr -d '\n' || echo "")
    echo "DART_DEFINES (from Generated.xcconfig): ${GENERATED_DART_DEFINES:0:200}"
fi
echo "========================================"

resolve_environment() {
    local environment_from_defines
    local generated_xcconfig="${SRCROOT}/../Flutter/Generated.xcconfig"
    local dart_defines_value=""

    if [ -n "${DART_DEFINES}" ]; then
        dart_defines_value="${DART_DEFINES}"
        echo "DEBUG: DART_DEFINES from environment variable" >&2
    elif [ -f "${generated_xcconfig}" ]; then
        dart_defines_value=$(grep "^DART_DEFINES=" "${generated_xcconfig}" | cut -d'=' -f2- | tr -d '\n' || echo "")
        echo "DEBUG: DART_DEFINES from Generated.xcconfig" >&2
    fi

    if [ -n "${dart_defines_value}" ]; then
        environment_from_defines="$(python3 <<PY
import base64
import sys

dart_defines = "${dart_defines_value}"
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
            elif decoded.startswith("PRODUCTION="):
                production_value = decoded.split("=", 1)[1]
                environment = "production" if production_value.lower() == "true" else "staging"
                print(f"DEBUG: Found PRODUCTION={production_value}, using environment={environment}", file=sys.stderr, flush=True)
                break
        except Exception as e:
            print(f"DEBUG: Failed to decode entry: {e}", file=sys.stderr, flush=True)
            continue
else:
    print("DEBUG: No DART_DEFINES found", file=sys.stderr, flush=True)

print(environment, flush=True)
PY
)"
    else
        echo "DEBUG: No DART_DEFINES found in environment or Generated.xcconfig" >&2
        environment_from_defines=""
    fi

    echo "DEBUG: environment_from_defines='${environment_from_defines}'" >&2

    if [ -n "${environment_from_defines}" ]; then
        echo "DEBUG: Using environment from DART_DEFINES: ${environment_from_defines}" >&2
        echo "${environment_from_defines}"
        return
    fi

    echo "DEBUG: No DART_DEFINES found or empty, using CONFIGURATION: ${CONFIGURATION}" >&2
    echo "DEBUG: CONFIGURATION value: '${CONFIGURATION}'" >&2
    case "${CONFIGURATION}" in
        *Release*)
            echo "DEBUG: CONFIGURATION contains 'Release', using production" >&2
            echo "production"
            ;;
        *Production*)
            echo "DEBUG: CONFIGURATION contains 'Production', using production" >&2
            echo "production"
            ;;
        Debug)
            echo "DEBUG: CONFIGURATION is 'Debug', using staging (default for debug builds)" >&2
            echo "staging"
            ;;
        *)
            echo "DEBUG: Default case (CONFIGURATION='${CONFIGURATION}'), using staging" >&2
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
        echo "Error: Firebase config file not found: ${source_file}"
        echo "DEBUG: Available files in Runner directory:"
        ls -la "${SRCROOT}/Runner/" | grep -i "googleservice" || echo "No GoogleService files found"
        exit 1
    fi

    cp "${source_file}" "${destination_file}"
    if [ ! -f "${destination_file}" ]; then
        echo "Error: Failed to copy Firebase config to: ${destination_file}"
        exit 1
    fi
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
