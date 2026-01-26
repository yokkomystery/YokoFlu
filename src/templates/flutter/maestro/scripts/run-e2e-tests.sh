#!/bin/bash
# E2Eテスト実行スクリプト
# 全フローを実行し、スクリーンショットを年月日別フォルダに整理保存
#
# 使用方法:
#   ./run-e2e-tests.sh                    # 全フロー実行
#   ./run-e2e-tests.sh --flow <name>      # 特定フロー実行
#   ./run-e2e-tests.sh --suite <name>     # テストスイート実行
#   ./run-e2e-tests.sh --list             # 利用可能なフロー一覧
#
# フォルダ構造:
#   test-results/
#     2026/
#       01-14_120000/
#         screenshots/
#         report.html
#         test-info.txt

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MAESTRO_DIR="$SCRIPT_DIR/.."
RESULTS_BASE_DIR="$MAESTRO_DIR/test-results"

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# 現在時刻から結果ディレクトリを生成
get_result_dir() {
    local year=$(date '+%Y')
    local timestamp=$(date '+%m-%d_%H%M%S')
    echo "$RESULTS_BASE_DIR/$year/$timestamp"
}

# デバイス情報を記録
record_device_info() {
    local output_dir="$1"
    local info_file="$output_dir/test-info.txt"

    echo "Recording device info to: $info_file"

    {
        echo "===== E2E Test Information ====="
        echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "Result Directory: $output_dir"
        echo ""

        # iOS シミュレータ情報
        echo "--- iOS Simulator ---"
        if command -v xcrun &> /dev/null; then
            local booted_device=$(xcrun simctl list devices booted 2>/dev/null | grep -E "^\s+" | head -1 | sed 's/^[[:space:]]*//')
            if [ -n "$booted_device" ]; then
                echo "Device: $booted_device"
            else
                echo "Device: No iOS simulator booted"
            fi
            echo "Xcode: $(xcodebuild -version 2>/dev/null | head -1 || echo 'Not found')"
        else
            echo "iOS: Not available (xcrun not found)"
        fi
        echo ""

        # Android エミュレータ情報
        echo "--- Android Emulator ---"
        if command -v adb &> /dev/null; then
            local android_device=$(adb devices 2>/dev/null | grep -E "emulator|device$" | head -1 | awk '{print $1}')
            if [ -n "$android_device" ]; then
                echo "Device: $android_device"
                echo "Model: $(adb shell getprop ro.product.model 2>/dev/null || echo 'Unknown')"
                echo "Android: $(adb shell getprop ro.build.version.release 2>/dev/null || echo 'Unknown')"
            else
                echo "Device: No Android device connected"
            fi
        else
            echo "Android: Not available (adb not found)"
        fi
        echo ""

        # Maestro バージョン
        echo "--- Tools ---"
        echo "Maestro: $(maestro --version 2>/dev/null || echo 'Not found')"
        echo ""

        # macOS 情報
        echo "--- Environment ---"
        echo "macOS: $(sw_vers -productVersion 2>/dev/null || echo 'Unknown')"
        echo "Shell: $SHELL"
        echo ""
    } > "$info_file"
}

# 実行結果サマリーを追記
record_summary() {
    local output_dir="$1"
    local flow_name="$2"
    local start_time="$3"
    local end_time="$4"
    local status="$5"
    local info_file="$output_dir/test-info.txt"

    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))

    {
        echo "===== Execution Summary ====="
        echo "Flow: ${flow_name:-full-flow}"
        echo "Duration: ${minutes}m ${seconds}s (${duration}s)"
        echo "Status: $status"
        echo ""
    } >> "$info_file"
}

# 利用可能なフロー一覧
list_flows() {
    echo -e "${CYAN}Available E2E flows:${NC}"
    echo ""
    echo "Main flows:"
    for flow in "$MAESTRO_DIR"/flows/*.yaml; do
        if [ -f "$flow" ]; then
            local name=$(basename "$flow" .yaml)
            echo -e "  - $name"
        fi
    done
    echo ""
    if [ -d "$MAESTRO_DIR/flows/suites" ]; then
        echo "Test suites:"
        for suite in "$MAESTRO_DIR"/flows/suites/*.yaml; do
            if [ -f "$suite" ]; then
                local name=$(basename "$suite" .yaml)
                echo -e "  - $name"
            fi
        done
        echo ""
    fi
}

# テスト実行
run_test() {
    local flow_file="$1"
    local result_dir="$2"

    local screenshot_dir="$result_dir/screenshots"
    mkdir -p "$screenshot_dir"

    echo -e "${CYAN}Running: $(basename "$flow_file")${NC}"
    echo "Screenshots: $screenshot_dir"
    echo ""

    # Maestroテスト実行
    # --test-output-dir で出力先を指定
    if maestro test --test-output-dir="$result_dir" "$flow_file"; then
        return 0
    else
        return 1
    fi
}

# HTMLレポート生成
generate_report() {
    local result_dir="$1"
    local flow_name="$2"
    local status="$3"
    local report_file="$result_dir/report.html"
    local screenshot_dir="$result_dir/screenshots"

    local title="E2E Test Report - ${flow_name:-Full Flow}"
    local status_color="#4CAF50"
    local status_icon="✓"
    if [ "$status" != "PASSED" ]; then
        status_color="#f44336"
        status_icon="✗"
    fi

    cat > "$report_file" << 'EOF'
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>E2E Test Report</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #eee;
        }
        .header {
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
            backdrop-filter: blur(10px);
        }
        h1 {
            color: #fff;
            margin: 0 0 8px 0;
            font-size: 1.8em;
        }
        .meta { color: #888; font-size: 0.9em; }
        .status {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 12px;
        }
        .status.passed { background: rgba(76, 175, 80, 0.2); color: #81c784; }
        .status.failed { background: rgba(244, 67, 54, 0.2); color: #e57373; }
        .screenshots {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 24px;
        }
        .screenshot-card {
            background: rgba(255,255,255,0.05);
            border-radius: 12px;
            overflow: hidden;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .screenshot-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .screenshot-card img {
            width: 100%;
            height: auto;
            display: block;
            cursor: pointer;
        }
        .screenshot-card .name {
            padding: 12px 16px;
            font-size: 0.9em;
            color: #aaa;
            border-top: 1px solid rgba(255,255,255,0.1);
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 100;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
        }
        .modal img {
            max-width: 95%;
            max-height: 95%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border-radius: 8px;
        }
        .modal-close {
            position: absolute;
            top: 20px;
            right: 30px;
            color: #fff;
            font-size: 40px;
            cursor: pointer;
            z-index: 101;
        }
        .no-screenshots {
            text-align: center;
            padding: 60px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>E2E Test Report</h1>
        <div class="meta">
            <span id="timestamp"></span> |
            <span id="flow-name"></span>
        </div>
        <div class="status" id="status"></div>
    </div>

    <h2>Screenshots</h2>
    <div class="screenshots" id="screenshots"></div>

    <div id="modal" class="modal" onclick="this.style.display='none'">
        <span class="modal-close">&times;</span>
        <img id="modal-img" src="">
    </div>

    <script>
        function showModal(src) {
            document.getElementById('modal-img').src = src;
            document.getElementById('modal').style.display = 'block';
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                document.getElementById('modal').style.display = 'none';
            }
        });
    </script>
</body>
</html>
EOF

    # スクリーンショット情報を追加
    local screenshots_html=""
    local screenshot_count=0

    if [ -d "$screenshot_dir" ]; then
        for img in "$screenshot_dir"/*.png; do
            if [ -f "$img" ]; then
                local img_name=$(basename "$img")
                local relative_path="screenshots/$img_name"
                screenshots_html+="<div class='screenshot-card'>"
                screenshots_html+="<img src='$relative_path' onclick=\"showModal(this.src)\" alt='$img_name'>"
                screenshots_html+="<div class='name'>$img_name</div>"
                screenshots_html+="</div>"
                ((screenshot_count++))
            fi
        done
    fi

    if [ $screenshot_count -eq 0 ]; then
        screenshots_html="<div class='no-screenshots'>No screenshots captured</div>"
    fi

    # ステータスを小文字に変換（Bash 3.2互換）
    local status_lower=$(echo "$status" | tr '[:upper:]' '[:lower:]')
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local flow_display="${flow_name:-Full Flow}"

    # HTMLにデータを直接埋め込む
    cat >> "$report_file" << SCRIPT_EOF
    <script>
        document.getElementById('timestamp').textContent = '$timestamp';
        document.getElementById('flow-name').textContent = '$flow_display';
        var statusEl = document.getElementById('status');
        statusEl.className = 'status $status_lower';
        statusEl.innerHTML = '$status_icon $status';
        document.getElementById('screenshots').innerHTML = \`$screenshots_html\`;
    </script>
SCRIPT_EOF

    echo -e "${GREEN}Report generated: $report_file${NC}"
}

# メイン処理
main() {
    local flow_name=""
    local suite_name=""
    local flow_file=""

    # 引数解析
    while [[ $# -gt 0 ]]; do
        case $1 in
            --flow)
                flow_name="$2"
                shift 2
                ;;
            --suite)
                suite_name="$2"
                shift 2
                ;;
            --list)
                list_flows
                exit 0
                ;;
            --help|-h)
                echo "Usage: $0 [--flow <name>] [--suite <name>] [--list]"
                echo ""
                echo "Options:"
                echo "  --flow <name>    Run specific flow"
                echo "  --suite <name>   Run test suite"
                echo "  --list           List available flows and suites"
                echo ""
                echo "Without options, runs full-flow.yaml"
                exit 0
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                exit 1
                ;;
        esac
    done

    # フローファイルの決定
    if [ -n "$suite_name" ]; then
        flow_file="$MAESTRO_DIR/flows/suites/$suite_name.yaml"
        flow_name="$suite_name"
    elif [ -n "$flow_name" ]; then
        flow_file="$MAESTRO_DIR/flows/$flow_name.yaml"
    else
        flow_file="$MAESTRO_DIR/flows/full-flow.yaml"
        flow_name="full-flow"
    fi

    # フローファイル存在確認
    if [ ! -f "$flow_file" ]; then
        echo -e "${RED}Error: Flow file not found: $flow_file${NC}"
        echo "Use --list to see available flows"
        exit 1
    fi

    # 結果ディレクトリ作成
    local result_dir=$(get_result_dir)
    mkdir -p "$result_dir"
    mkdir -p "$result_dir/screenshots"

    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}  E2E Test Runner${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo -e "Flow: ${CYAN}$flow_name${NC}"
    echo -e "Output: ${CYAN}$result_dir${NC}"
    echo ""

    # デバイス情報記録
    record_device_info "$result_dir"

    # テスト実行
    local start_time=$(date +%s)
    local test_status="PASSED"

    if ! run_test "$flow_file" "$result_dir"; then
        test_status="FAILED"
    fi

    local end_time=$(date +%s)

    # サマリー記録
    record_summary "$result_dir" "$flow_name" "$start_time" "$end_time" "$test_status"

    # スクリーンショットを整理
    if [ -d "$result_dir/screenshots" ] && [ "$(ls -A "$result_dir/screenshots" 2>/dev/null)" ]; then
        echo -e "${GREEN}Screenshots saved to: $result_dir/screenshots${NC}"
    fi

    # レポート生成
    generate_report "$result_dir" "$flow_name" "$test_status"

    # 結果表示
    echo ""
    echo -e "${GREEN}================================================${NC}"
    if [ "$test_status" = "PASSED" ]; then
        echo -e "${GREEN}  ✓ Test $test_status${NC}"
    else
        echo -e "${RED}  ✗ Test $test_status${NC}"
    fi
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo "Results: $result_dir"
    echo "Report:  $result_dir/report.html"
    echo ""

    # レポートを開く
    open "$result_dir/report.html" 2>/dev/null || true

    # 失敗時はexit 1
    if [ "$test_status" = "FAILED" ]; then
        exit 1
    fi
}

main "$@"
