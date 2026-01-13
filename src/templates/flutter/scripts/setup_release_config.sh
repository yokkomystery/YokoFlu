#!/bin/bash

# Release.xcconfigをDART_DEFINESに基づいて動的に設定するスクリプト
# このスクリプトはHimaLinkで採用している方法と同一で、
# `--dart-define=PRODUCTION=true` でProduction.xcconfigをincludeする

set +e

RELEASE_XCCONFIG="${SRCROOT}/../Flutter/Release.xcconfig"
RELEASE_XCCONFIG_BACKUP="${RELEASE_XCCONFIG}.bak"
PROFILE_XCCONFIG="${SRCROOT}/../Flutter/Profile.xcconfig"
PROFILE_XCCONFIG_BACKUP="${PROFILE_XCCONFIG}.bak"

echo "========================================"
echo "Release Config Setup Script"
echo "========================================"
echo "CONFIGURATION: ${CONFIGURATION}"
echo "DART_DEFINES: ${DART_DEFINES}"
echo "========================================"

resolve_production_flag() {
    local production_from_defines

    production_from_defines="$(python3 <<'PY'
import base64
import os
import sys

dart_defines = os.environ.get("DART_DEFINES", "")
production = "false"

if dart_defines:
    for entry in filter(None, dart_defines.split(",")):
        try:
            decoded = base64.b64decode(entry).decode("utf-8")
            if decoded.startswith("PRODUCTION="):
                production_value = decoded.split("=", 1)[1]
                production = production_value.lower()
                print(f"DEBUG: Found PRODUCTION={production_value}", file=sys.stderr, flush=True)
                break
        except Exception:
            continue

print(production, flush=True)
PY
)"

    if [ -n "${production_from_defines}" ]; then
        echo "${production_from_defines}"
        return
    fi

    case "${CONFIGURATION}" in
        *Release*|*Profile*)
            echo "true"
            ;;
        *)
            echo "false"
            ;;
    esac
}

PRODUCTION_FLAG=$(resolve_production_flag)
echo "Resolved PRODUCTION flag: ${PRODUCTION_FLAG}"

if [ "${CONFIGURATION}" != "Release" ] && [ "${CONFIGURATION}" != "Profile" ]; then
    echo "⚠️  Not a Release/Profile build, skipping Release.xcconfig setup"
    exit 0
fi

if [ ! -f "${RELEASE_XCCONFIG_BACKUP}" ]; then
    cp "${RELEASE_XCCONFIG}" "${RELEASE_XCCONFIG_BACKUP}"
fi

if [ ! -f "${PROFILE_XCCONFIG_BACKUP}" ]; then
    cp "${PROFILE_XCCONFIG}" "${PROFILE_XCCONFIG_BACKUP}"
fi

if [ "${PRODUCTION_FLAG}" = "true" ]; then
    {
        echo '#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.release.xcconfig"'
        echo '#include "Generated.xcconfig"'
        echo '#include "../Production.xcconfig"'
    } > "${RELEASE_XCCONFIG}"

    {
        echo '#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.profile.xcconfig"'
        echo '#include "Generated.xcconfig"'
        echo '#include "../Production.xcconfig"'
    } > "${PROFILE_XCCONFIG}"
else
    {
        echo '#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.release.xcconfig"'
        echo '#include "Generated.xcconfig"'
        echo '#include "../Staging.xcconfig"'
    } > "${RELEASE_XCCONFIG}"

    {
        echo '#include? "Pods/Target Support Files/Pods-Runner/Pods-Runner.profile.xcconfig"'
        echo '#include "Generated.xcconfig"'
        echo '#include "../Staging.xcconfig"'
    } > "${PROFILE_XCCONFIG}"
fi

echo "✅ Configuration files updated successfully"
echo "========================================"
