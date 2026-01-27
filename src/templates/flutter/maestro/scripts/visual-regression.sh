#!/bin/bash
# ビジュアルリグレッションテスト スクリプト
# 前回のスクリーンショットと比較して差分を検出
#
# 使用方法:
#   ./visual-regression.sh save-baseline [flow-name]  # ベースライン保存
#   ./visual-regression.sh compare [flow-name]        # 比較
#   ./visual-regression.sh run [flow-name]            # テスト実行→比較→レポート
#   ./visual-regression.sh report [flow-name]         # HTMLレポート生成
#
# フロー単位での実行:
#   ./visual-regression.sh run diary-flow             # diary-flow.yamlのみ
#   ./visual-regression.sh save-baseline ai-chat      # ai-chat.yamlのベースライン保存

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MAESTRO_DIR="$SCRIPT_DIR/.."
BASELINE_BASE_DIR="$MAESTRO_DIR/baseline"
DIFF_BASE_DIR="$MAESTRO_DIR/diff-results"
THRESHOLD=${THRESHOLD:-0.1}  # 差分許容率（デフォルト10%）

# 日時別のdiff-resultsディレクトリを取得
get_diff_dir() {
    local year=$(date '+%Y')
    local timestamp=$(date '+%m-%d_%H%M%S')
    echo "$DIFF_BASE_DIR/$year/$timestamp"
}

# 現在のセッション用のDIFF_DIR（runコマンドで設定）
DIFF_DIR=""

# システム表示除外設定（ステータスバー・ホームインジケーター）
# iPhone 16 Pro @3x: 上部120px, 下部100px
CROP_TOP=${CROP_TOP:-120}
CROP_BOTTOM=${CROP_BOTTOM:-100}

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# テスト情報ファイル
TEST_INFO_FILE=""

# ImageMagickの確認
check_imagemagick() {
    if ! command -v compare &> /dev/null; then
        echo -e "${RED}Error: ImageMagick is not installed.${NC}"
        echo "Install with: brew install imagemagick"
        exit 1
    fi
}

# デバイス情報を取得・記録
record_device_info() {
    local output_dir="$1"
    TEST_INFO_FILE="$output_dir/test-info.txt"

    echo "Recording device info to: $TEST_INFO_FILE"

    {
        echo "===== Test Information ====="
        echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
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
        echo "ImageMagick: $(magick --version 2>/dev/null | head -1 || echo 'Not found')"
        echo ""

        # macOS 情報
        echo "--- Environment ---"
        echo "macOS: $(sw_vers -productVersion 2>/dev/null || echo 'Unknown')"
        echo "Shell: $SHELL"
        echo ""
    } > "$TEST_INFO_FILE"
}

# 実行時間を計測・記録
record_execution_time() {
    local flow_name="$1"
    local start_time="$2"
    local end_time="$3"
    local status="$4"

    if [ -z "$TEST_INFO_FILE" ] || [ ! -f "$TEST_INFO_FILE" ]; then
        return
    fi

    local duration=$((end_time - start_time))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))

    {
        echo "===== Execution Time ====="
        echo "Flow: ${flow_name:-all}"
        echo "Duration: ${minutes}m ${seconds}s (${duration}s)"
        echo "Status: $status"
        echo ""
    } >> "$TEST_INFO_FILE"

    echo -e "${CYAN}Execution time: ${minutes}m ${seconds}s${NC}"
}

# ベースラインディレクトリを取得（フロー名対応）
get_baseline_dir() {
    local flow_name="$1"
    if [ -n "$flow_name" ]; then
        echo "$BASELINE_BASE_DIR/$flow_name"
    else
        echo "$BASELINE_BASE_DIR/_all"
    fi
}

# 画像をクロップしてシステム表示を除外
crop_system_ui() {
    local input="$1"
    local output="$2"

    local img_width=$(magick identify -format "%w" "$input")
    local img_height=$(magick identify -format "%h" "$input")
    local crop_height=$((img_height - CROP_TOP - CROP_BOTTOM))
    local crop_geometry="${img_width}x${crop_height}+0+${CROP_TOP}"

    magick "$input" -crop "$crop_geometry" +repage "$output"
}

# JSONからスクリーンショット名マッピングを取得
get_screenshot_names() {
    local test_dir="$1"
    local json_files=("$test_dir"/commands-*.json)

    if [ -f "${json_files[0]}" ]; then
        for json_file in "${json_files[@]}"; do
            if [ -f "$json_file" ]; then
                python3 -c "
import json, sys
with open('$json_file') as f:
    data = json.load(f)
for item in data:
    cmd = item.get('command', {})
    if 'takeScreenshotCommand' in cmd:
        screenshot = cmd['takeScreenshotCommand']
        timestamp = item.get('metadata', {}).get('timestamp', '')
        name = screenshot.get('path', '')
        if timestamp and name:
            print(f'{timestamp}:{name}')
" 2>/dev/null
            fi
        done
    fi
}

# タイムスタンプからスクリーンショット名を取得
get_name_for_timestamp() {
    local target_ts="$1"
    local mapping="$2"
    local best_name=""
    local best_diff=999999999

    while IFS=: read -r ts name; do
        if [ -n "$ts" ] && [ -n "$name" ]; then
            local diff=$((target_ts - ts))
            if [ $diff -lt 0 ]; then
                diff=$((-diff))
            fi
            if [ $diff -lt $best_diff ]; then
                best_diff=$diff
                best_name=$name
            fi
        fi
    done <<< "$mapping"

    echo "$best_name"
}

# フロー名でスクリーンショットをフィルタリング
filter_screenshots_by_flow() {
    local test_dir="$1"
    local flow_name="$2"
    local filtered=()

    for img in "$test_dir"/*.png; do
        if [ -f "$img" ]; then
            local basename=$(basename "$img")
            # 新形式（シンプルな名前: 01_home_screen.png等）かどうかを判定
            if echo "$basename" | grep -q "^[0-9].*\.png$"; then
                # 新形式の場合は全て対象とする
                filtered+=("$img")
            elif [ -z "$flow_name" ] || echo "$basename" | grep -q "($flow_name.yaml)"; then
                # 旧形式の場合はフロー名でフィルタ
                filtered+=("$img")
            fi
        fi
    done

    printf '%s\n' "${filtered[@]}"
}

# ベースラインを保存
save_baseline() {
    local flow_name="$1"
    local test_dir="$2"

    if [ -z "$test_dir" ]; then
        # 最新のテスト結果を使用
        test_dir=$(ls -td ~/.maestro/tests/*/ 2>/dev/null | head -1)
    fi

    if [ -z "$test_dir" ] || [ ! -d "$test_dir" ]; then
        echo -e "${RED}Error: No test results found.${NC}"
        exit 1
    fi

    local baseline_dir=$(get_baseline_dir "$flow_name")

    if [ -n "$flow_name" ]; then
        echo -e "${CYAN}Saving baseline for flow: $flow_name${NC}"
    else
        echo -e "${CYAN}Saving baseline for all flows${NC}"
    fi
    echo -e "${YELLOW}From: $test_dir${NC}"

    # ベースラインディレクトリをクリア＆作成
    rm -rf "$baseline_dir"
    mkdir -p "$baseline_dir"

    # JSONからスクリーンショット名マッピングを取得
    local screenshot_mapping=$(get_screenshot_names "$test_dir")

    # フローでフィルタリング
    local screenshots
    if [ -n "$flow_name" ]; then
        screenshots=$(filter_screenshots_by_flow "$test_dir" "$flow_name")
    else
        screenshots=$(ls "$test_dir"/*.png 2>/dev/null)
    fi

    # スクリーンショットをコピー（ファイル名を正規化）
    local count=0
    local index=1
    while IFS= read -r img; do
        if [ -f "$img" ]; then
            local basename=$(basename "$img")
            local normalized_name

            # 新形式かどうかを判定
            if echo "$basename" | grep -q "^[0-9].*\.png$"; then
                normalized_name="$basename"
            else
                local timestamp=$(echo "$basename" | sed 's/.*-\([0-9]*\)-(.*/\1/')
                local screenshot_name=$(get_name_for_timestamp "$timestamp" "$screenshot_mapping")

                if [ -n "$screenshot_name" ]; then
                    normalized_name="${screenshot_name}.png"
                else
                    local flow_part=$(echo "$basename" | sed 's/.*-(\(.*\))\.png/\1/')
                    normalized_name=$(printf "%02d-%s.png" $index "$flow_part")
                fi
            fi

            cp "$img" "$baseline_dir/$normalized_name"
            echo "  $normalized_name"
            ((count++))
            ((index++))
        fi
    done <<< "$screenshots"

    if [ $count -eq 0 ]; then
        echo -e "${RED}No screenshots found for flow: $flow_name${NC}"
        exit 1
    fi

    echo -e "${GREEN}Saved $count screenshots to baseline.${NC}"
    echo "Baseline directory: $baseline_dir"
}

# 差分比較を実行
compare_screenshots() {
    local flow_name="$1"
    local test_dir="$2"

    if [ -z "$test_dir" ]; then
        test_dir=$(ls -td ~/.maestro/tests/*/ 2>/dev/null | head -1)
    fi

    local baseline_dir=$(get_baseline_dir "$flow_name")

    if [ ! -d "$baseline_dir" ]; then
        echo -e "${RED}Error: No baseline found at $baseline_dir${NC}"
        echo "Run 'save-baseline${flow_name:+ $flow_name}' first."
        exit 1
    fi

    if [ -z "$test_dir" ] || [ ! -d "$test_dir" ]; then
        echo -e "${RED}Error: No test results found.${NC}"
        exit 1
    fi

    if [ -n "$flow_name" ]; then
        echo -e "${CYAN}Comparing screenshots for flow: $flow_name${NC}"
    else
        echo -e "${CYAN}Comparing all screenshots${NC}"
    fi
    echo "Baseline: $baseline_dir"
    echo "Current:  $test_dir"

    # 差分結果ディレクトリを作成
    if [ -z "$DIFF_DIR" ]; then
        DIFF_DIR=$(get_diff_dir)
    fi
    local diff_subdir="$DIFF_DIR"
    if [ -n "$flow_name" ]; then
        diff_subdir="$DIFF_DIR/$flow_name"
    fi
    mkdir -p "$diff_subdir"

    # JSONからスクリーンショット名マッピングを取得
    local screenshot_mapping=$(get_screenshot_names "$test_dir")

    # フローでフィルタリング
    local screenshots
    if [ -n "$flow_name" ]; then
        screenshots=$(filter_screenshots_by_flow "$test_dir" "$flow_name")
    else
        screenshots=$(ls "$test_dir"/*.png 2>/dev/null)
    fi

    local total=0
    local passed=0
    local failed=0
    local new_files=0
    local results=()
    local index=1

    # 現在のスクリーンショットをループ
    while IFS= read -r img; do
        if [ -f "$img" ]; then
            local basename=$(basename "$img")
            local normalized_name

            if echo "$basename" | grep -q "^[0-9].*\.png$"; then
                normalized_name="$basename"
            else
                local timestamp=$(echo "$basename" | sed 's/.*-\([0-9]*\)-(.*/\1/')
                local screenshot_name=$(get_name_for_timestamp "$timestamp" "$screenshot_mapping")

                if [ -n "$screenshot_name" ]; then
                    normalized_name="${screenshot_name}.png"
                else
                    local flow_part=$(echo "$basename" | sed 's/.*-(\(.*\))\.png/\1/')
                    normalized_name=$(printf "%02d-%s.png" $index "$flow_part")
                fi
            fi

            local baseline_img="$baseline_dir/$normalized_name"

            ((total++))

            if [ -f "$baseline_img" ]; then
                local diff_output="$diff_subdir/diff-$normalized_name"
                local diff_result

                # システム表示を除外するためクロップ
                local tmp_baseline="/tmp/vr_baseline_$$.png"
                local tmp_current="/tmp/vr_current_$$.png"
                crop_system_ui "$baseline_img" "$tmp_baseline"
                crop_system_ui "$img" "$tmp_current"

                # ImageMagickで比較
                diff_output_raw=$(compare -metric AE -highlight-color red -lowlight-color white -compose src "$tmp_baseline" "$tmp_current" "$diff_output" 2>&1 || true)
                diff_pixels=$(echo "$diff_output_raw" | awk '{print $1}' | awk -F'e' '{if(NF==2){printf "%.0f\n", $1 * (10 ^ $2)}else{print $1}}')

                img_width=$(magick identify -format "%w" "$tmp_current")
                img_height=$(magick identify -format "%h" "$tmp_current")
                total_pixels=$((img_width * img_height))

                rm -f "$tmp_baseline" "$tmp_current"

                if [ "$total_pixels" -gt 0 ] && [ -n "$diff_pixels" ]; then
                    diff_rate=$(awk "BEGIN {printf \"%.4f\", $diff_pixels / $total_pixels}")
                else
                    diff_rate=0
                fi

                if (( $(echo "$diff_rate <= $THRESHOLD" | bc -l) )); then
                    ((passed++))
                    results+=("${GREEN}✓${NC} $normalized_name (diff: ${diff_rate}%)")
                    rm -f "$diff_output"
                else
                    ((failed++))
                    results+=("${RED}✗${NC} $normalized_name (diff: ${diff_rate}% > ${THRESHOLD}%)")
                fi
            else
                ((new_files++))
                results+=("${YELLOW}?${NC} $normalized_name (new file - no baseline)")
            fi
            ((index++))
        fi
    done <<< "$screenshots"

    # 結果を表示
    echo ""
    echo "========================================"
    if [ -n "$flow_name" ]; then
        echo "   Visual Regression: $flow_name"
    else
        echo "   Visual Regression Results"
    fi
    echo "========================================"
    echo ""

    for result in "${results[@]}"; do
        echo -e "$result"
    done

    echo ""
    echo "----------------------------------------"
    echo -e "Total:  $total"
    echo -e "${GREEN}Passed: $passed${NC}"
    echo -e "${RED}Failed: $failed${NC}"
    echo -e "${YELLOW}New:    $new_files${NC}"
    echo "----------------------------------------"

    if [ $failed -gt 0 ]; then
        echo ""
        echo -e "${RED}Visual regression detected!${NC}"
        echo "Diff images saved to: $diff_subdir"
        return 1
    else
        echo ""
        echo -e "${GREEN}All screenshots match baseline!${NC}"
        return 0
    fi
}

# HTMLレポートを生成
generate_report() {
    local flow_name="$1"
    local test_dir="$2"
    local baseline_dir=$(get_baseline_dir "$flow_name")

    if [ -z "$DIFF_DIR" ]; then
        DIFF_DIR=$(get_diff_dir)
    fi
    local diff_subdir="$DIFF_DIR"
    if [ -n "$flow_name" ]; then
        diff_subdir="$DIFF_DIR/$flow_name"
    fi

    local report_file="$diff_subdir/report.html"
    if [ -z "$test_dir" ]; then
        test_dir=$(ls -td ~/.maestro/tests/*/ 2>/dev/null | head -1)
    fi

    mkdir -p "$diff_subdir"

    local title="Visual Regression Report"
    if [ -n "$flow_name" ]; then
        title="Visual Regression: $flow_name"
    fi

    cat > "$report_file" << EOF
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>$title</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; background: #1a1a2e; color: #eee; }
        h1 { color: #fff; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        h2 { color: #ccc; margin-top: 30px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .summary-item { background: #16213e; padding: 15px 25px; border-radius: 8px; text-align: center; }
        .summary-item .number { font-size: 2em; font-weight: bold; }
        .summary-item.pass .number { color: #4CAF50; }
        .summary-item.fail .number { color: #f44336; }
        .summary-item.new .number { color: #ff9800; }
        .comparison { display: flex; gap: 15px; margin: 20px 0; background: #16213e; padding: 20px; border-radius: 8px; flex-wrap: wrap; }
        .comparison.fail { border-left: 4px solid #f44336; }
        .comparison.pass { border-left: 4px solid #4CAF50; }
        .comparison.new { border-left: 4px solid #ff9800; }
        .comparison .image-container { flex: 1; min-width: 200px; max-width: 350px; }
        .comparison img { width: 100%; height: auto; border: 2px solid #333; border-radius: 4px; cursor: pointer; transition: transform 0.2s; }
        .comparison img:hover { transform: scale(1.02); }
        .comparison .label { font-weight: bold; margin-bottom: 8px; font-size: 0.9em; color: #aaa; }
        .comparison .filename { font-size: 1.1em; margin-bottom: 10px; color: #fff; }
        .comparison .diff-rate { font-size: 0.9em; padding: 4px 8px; border-radius: 4px; display: inline-block; }
        .diff-rate.pass { background: #1b5e20; color: #a5d6a7; }
        .diff-rate.fail { background: #b71c1c; color: #ef9a9a; }
        .modal { display: none; position: fixed; z-index: 100; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); }
        .modal img { max-width: 90%; max-height: 90%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
        .modal-close { position: absolute; top: 20px; right: 30px; color: #fff; font-size: 40px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>$title</h1>
    <p>Generated: <script>document.write(new Date().toLocaleString('ja-JP'))</script></p>

    <div id="content"></div>

    <div id="modal" class="modal" onclick="this.style.display='none'">
        <span class="modal-close">&times;</span>
        <img id="modal-img" src="">
    </div>

    <script>
        function showModal(src) {
            document.getElementById('modal-img').src = src;
            document.getElementById('modal').style.display = 'block';
        }
    </script>
</body>
</html>
EOF

    # 比較データを収集してHTMLに追加
    local content=""
    local passed=0
    local failed=0
    local new_count=0
    local index=1

    local screenshot_mapping=$(get_screenshot_names "$test_dir")

    local screenshots
    if [ -n "$flow_name" ]; then
        screenshots=$(filter_screenshots_by_flow "$test_dir" "$flow_name")
    else
        screenshots=$(ls "$test_dir"/*.png 2>/dev/null)
    fi

    if [ -d "$baseline_dir" ] && [ -n "$test_dir" ]; then
        while IFS= read -r img; do
            if [ -f "$img" ]; then
                local basename=$(basename "$img")
                local normalized_name

                if echo "$basename" | grep -q "^[0-9].*\.png$"; then
                    normalized_name="$basename"
                else
                    local timestamp=$(echo "$basename" | sed 's/.*-\([0-9]*\)-(.*/\1/')
                    local screenshot_name=$(get_name_for_timestamp "$timestamp" "$screenshot_mapping")

                    if [ -n "$screenshot_name" ]; then
                        normalized_name="${screenshot_name}.png"
                    else
                        local flow_part=$(echo "$basename" | sed 's/.*-(\(.*\))\.png/\1/')
                        normalized_name=$(printf "%02d-%s.png" $index "$flow_part")
                    fi
                fi

                local baseline_img="$baseline_dir/$normalized_name"
                local diff_img="$diff_subdir/diff-$normalized_name"
                local status="new"
                local diff_rate="N/A"

                if [ -f "$baseline_img" ]; then
                    local tmp_baseline="/tmp/vr_report_baseline_$$.png"
                    local tmp_current="/tmp/vr_report_current_$$.png"
                    crop_system_ui "$baseline_img" "$tmp_baseline"
                    crop_system_ui "$img" "$tmp_current"

                    diff_output_raw=$(compare -metric AE -highlight-color red -lowlight-color white -compose src "$tmp_baseline" "$tmp_current" "$diff_img" 2>&1 || true)
                    diff_pixels=$(echo "$diff_output_raw" | awk '{print $1}' | awk -F'e' '{if(NF==2){printf "%.0f\n", $1 * (10 ^ $2)}else{print $1}}')

                    img_width=$(magick identify -format "%w" "$tmp_current")
                    img_height=$(magick identify -format "%h" "$tmp_current")
                    total_pixels=$((img_width * img_height))

                    rm -f "$tmp_baseline" "$tmp_current"

                    if [ "$total_pixels" -gt 0 ] && [ -n "$diff_pixels" ]; then
                        diff_rate=$(awk "BEGIN {printf \"%.4f\", $diff_pixels / $total_pixels * 100}")
                    else
                        diff_rate="0"
                    fi

                    if (( $(echo "$diff_rate <= $THRESHOLD * 100" | bc -l) )); then
                        status="pass"
                        ((passed++))
                        rm -f "$diff_img"
                    else
                        status="fail"
                        ((failed++))
                    fi
                else
                    ((new_count++))
                fi

                content+="<div class='comparison $status'>"
                content+="<div style='width:100%;margin-bottom:10px;'>"
                content+="<span class='filename'>$normalized_name</span> "
                if [ "$status" = "pass" ]; then
                    content+="<span class='diff-rate pass'>✓ ${diff_rate}%</span>"
                elif [ "$status" = "fail" ]; then
                    content+="<span class='diff-rate fail'>✗ ${diff_rate}%</span>"
                else
                    content+="<span class='diff-rate' style='background:#5d4037;color:#ffcc80;'>? New</span>"
                fi
                content+="</div>"

                if [ -f "$baseline_img" ]; then
                    content+="<div class='image-container'><div class='label'>Baseline</div>"
                    content+="<img src='$baseline_img' onclick=\"showModal(this.src)\"></div>"
                else
                    content+="<div class='image-container'><div class='label'>Baseline</div>"
                    content+="<div style='background:#333;padding:50px;text-align:center;border-radius:4px;'>No baseline</div></div>"
                fi

                content+="<div class='image-container'><div class='label'>Current</div>"
                content+="<img src='$img' onclick=\"showModal(this.src)\"></div>"

                if [ -f "$diff_img" ]; then
                    content+="<div class='image-container'><div class='label'>Diff</div>"
                    content+="<img src='$diff_img' onclick=\"showModal(this.src)\"></div>"
                fi

                content+="</div>"
                ((index++))
            fi
        done <<< "$screenshots"
    fi

    local total=$((passed + failed + new_count))
    sed -i '' "s|<div id=\"content\"></div>|<h2>Summary</h2><div class='summary'><div class='summary-item pass'><div class='number'>$passed</div><div>Passed</div></div><div class='summary-item fail'><div class='number'>$failed</div><div>Failed</div></div><div class='summary-item new'><div class='number'>$new_count</div><div>New</div></div><div class='summary-item'><div class='number'>$total</div><div>Total</div></div></div><h2>Screenshots</h2>$content|" "$report_file"

    echo -e "${GREEN}Report generated: $report_file${NC}"
    open "$report_file" 2>/dev/null || echo "Open the report manually: $report_file"
}

# 古いテスト結果をクリーンアップ
cleanup_old_tests() {
    local keep_count="${1:-5}"
    local test_base_dir="$HOME/.maestro/tests"

    if [ ! -d "$test_base_dir" ]; then
        echo -e "${YELLOW}No test results found.${NC}"
        return
    fi

    local total_count=$(ls -d "$test_base_dir"/*/ 2>/dev/null | wc -l | tr -d ' ')
    local delete_count=$((total_count - keep_count))

    if [ "$delete_count" -le 0 ]; then
        echo -e "${GREEN}Only $total_count test results found. Nothing to clean up.${NC}"
        return
    fi

    echo -e "${YELLOW}Found $total_count test results. Keeping latest $keep_count...${NC}"

    local deleted=0
    for dir in $(ls -d "$test_base_dir"/*/ 2>/dev/null | head -n "$delete_count"); do
        echo "Deleting: $(basename "$dir")"
        rm -rf "$dir"
        ((deleted++))
    done

    local new_size=$(du -sh "$test_base_dir" 2>/dev/null | cut -f1)
    echo -e "${GREEN}Deleted $deleted old test results. Current size: $new_size${NC}"
}

# フローリスト表示
list_flows() {
    echo -e "${CYAN}Available E2E flows:${NC}"
    echo ""
    for flow in "$MAESTRO_DIR"/flows/*.yaml; do
        if [ -f "$flow" ]; then
            local name=$(basename "$flow" .yaml)
            local baseline_dir=$(get_baseline_dir "$name")
            if [ -d "$baseline_dir" ]; then
                local count=$(ls -1 "$baseline_dir"/*.png 2>/dev/null | wc -l | tr -d ' ')
                echo -e "  ${GREEN}●${NC} $name (baseline: $count screenshots)"
            else
                echo -e "  ${YELLOW}○${NC} $name (no baseline)"
            fi
        fi
    done
    echo ""
}

# ヘルプ表示
show_help() {
    echo "Visual Regression Testing Script for Maestro"
    echo ""
    echo "Usage: $0 <command> [flow-name] [options]"
    echo ""
    echo "Commands:"
    echo "  save-baseline [flow]    Save screenshots as baseline"
    echo "  compare [flow]          Compare current screenshots with baseline"
    echo "  report [flow]           Generate HTML diff report"
    echo "  run [flow]              Run test, compare, and generate report"
    echo "  list                    List available flows and baseline status"
    echo "  cleanup [keep-count]    Delete old test results (default: keep 5)"
    echo ""
    echo "Flow-specific Examples:"
    echo "  $0 save-baseline diary-flow    # Save baseline for diary-flow.yaml"
    echo "  $0 compare ai-chat             # Compare ai-chat.yaml screenshots"
    echo "  $0 run calendar                # Full workflow for calendar.yaml"
    echo ""
    echo "All-flows Examples:"
    echo "  $0 save-baseline               # Save baseline for all flows"
    echo "  $0 run                         # Full workflow for all flows"
    echo ""
    echo "Environment Variables:"
    echo "  THRESHOLD                 Diff threshold (default: 0.1 = 10%)"
}

# メイン処理
main() {
    local command="${1:-}"
    local flow_name="${2:-}"

    case "$command" in
        save-baseline)
            check_imagemagick
            if [ -d "$MAESTRO_DIR/screenshots" ] && [ "$(ls -A "$MAESTRO_DIR/screenshots" 2>/dev/null)" ]; then
                save_baseline "$flow_name" "$MAESTRO_DIR/screenshots"
            else
                save_baseline "$flow_name"
            fi
            ;;
        compare)
            check_imagemagick
            if [ -d "$MAESTRO_DIR/screenshots" ] && [ "$(ls -A "$MAESTRO_DIR/screenshots" 2>/dev/null)" ]; then
                compare_screenshots "$flow_name" "$MAESTRO_DIR/screenshots"
            else
                compare_screenshots "$flow_name"
            fi
            ;;
        report)
            if [ -d "$MAESTRO_DIR/screenshots" ] && [ "$(ls -A "$MAESTRO_DIR/screenshots" 2>/dev/null)" ]; then
                generate_report "$flow_name" "$MAESTRO_DIR/screenshots"
            else
                generate_report "$flow_name"
            fi
            ;;
        run)
            check_imagemagick

            # 日時別の差分結果ディレクトリを作成
            DIFF_DIR=$(get_diff_dir)
            local diff_subdir="$DIFF_DIR"
            if [ -n "$flow_name" ]; then
                diff_subdir="$DIFF_DIR/$flow_name"
            fi
            mkdir -p "$diff_subdir"

            echo -e "${CYAN}Diff results will be saved to: $DIFF_DIR${NC}"

            # デバイス情報を記録
            record_device_info "$diff_subdir"

            # 実行開始時間
            local start_time=$(date +%s)
            local test_status="success"

            # スクリーンショット出力先ディレクトリ
            local screenshot_output_dir="$MAESTRO_DIR"
            rm -rf "$MAESTRO_DIR/screenshots"
            mkdir -p "$MAESTRO_DIR/screenshots"

            if [ -n "$flow_name" ]; then
                echo -e "${CYAN}Running E2E test for: $flow_name${NC}"
                if ! maestro test --test-output-dir="$screenshot_output_dir" "$MAESTRO_DIR/flows/$flow_name.yaml"; then
                    test_status="failed"
                fi
            else
                echo -e "${CYAN}Running full-flow test...${NC}"
                if ! maestro test --test-output-dir="$screenshot_output_dir" "$MAESTRO_DIR/flows/full-flow.yaml"; then
                    test_status="failed"
                    # テスト失敗時でもcleanupフローがあれば実行
                    if [ -f "$MAESTRO_DIR/flows/cleanup.yaml" ]; then
                        echo -e "${YELLOW}Test failed, running cleanup...${NC}"
                        maestro test "$MAESTRO_DIR/flows/cleanup.yaml" || true
                    fi
                fi
            fi

            # 実行終了時間を記録
            local end_time=$(date +%s)
            record_execution_time "$flow_name" "$start_time" "$end_time" "$test_status"

            # テストが失敗しても比較とレポートは生成
            compare_screenshots "$flow_name" "$MAESTRO_DIR/screenshots" || true
            generate_report "$flow_name" "$MAESTRO_DIR/screenshots"
            cleanup_old_tests 10

            # テスト情報を表示
            if [ -f "$TEST_INFO_FILE" ]; then
                echo ""
                echo -e "${CYAN}Test info saved to: $TEST_INFO_FILE${NC}"
            fi

            # 最新のdiff-resultsへのシンボリックリンクを作成
            ln -sfn "$DIFF_DIR" "$DIFF_BASE_DIR/latest"
            echo -e "${CYAN}Latest diff results: $DIFF_BASE_DIR/latest${NC}"
            ;;
        list)
            list_flows
            ;;
        cleanup)
            cleanup_old_tests "$flow_name"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
}

main "$@"
