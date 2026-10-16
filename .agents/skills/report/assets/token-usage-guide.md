# Hướng dẫn đo token qua CLI

Chỉ đọc file này khi thực sự cần đo usage bằng CLI JSONL (Codex/Claude Code/Antigravity) hoặc cần hiểu hook `test-token-usage`. Phần cốt lõi (format dòng `Token:`, fallback `N/A`, snapshot/một phần) đã nêu trong `SKILL.md` — không cần đọc file này cho báo cáo thông thường.

## Phiên Codex hiện tại

```bash
node .agents/skills/report/scripts/token-usage.mjs --runtime codex-rollout --current-session --task 'current-task'
```

Chỉ khi cần báo usage phiên hiện tại: `--current-session` chọn đúng rollout theo `CODEX_THREAD_ID` trong `$CODEX_HOME/sessions` (mặc định `~/.codex/sessions`). Không có ID/file hoặc nhiều file khớp thì báo giới hạn, không chọn phiên khác. Script chỉ đọc file khớp, lấy snapshot `token_count.info.total_token_usage` cuối, không cộng nhiều snapshot hoặc cached/reasoning token. Đây là tổng phiên tại thời điểm đọc, không phải tổng riêng task hay câu trả lời đang sinh; `last_usage` chỉ là request cuối được ghi. Có thể dùng `--input` với rollout chỉ định thay vì `--current-session`; không dùng cả hai.

## Codex, Claude Code và Antigravity CLI

Dùng [token-usage.mjs](../scripts/token-usage.mjs) với `--runtime codex|claude|antigravity` (mặc định codex) và stream/file JSONL được chọn. Script chỉ đọc usage, không chạy task hay gọi API. Schema nguồn: [Codex](https://learn.chatgpt.com/docs/non-interactive-mode), [Claude Code](https://code.claude.com/docs/en/agent-sdk/cost-tracking), [Antigravity CLI](https://antigravity.google/docs/cli/headless/).

```bash
codex exec --json 'Review current changes' | node .agents/skills/report/scripts/token-usage.mjs --task 'review-changes' --skill workflow-review --command review
node .agents/skills/report/scripts/token-usage.mjs --input /path/to/task.jsonl --task 'review-changes' --format json
claude -p 'Review current changes' --output-format stream-json --verbose | node .agents/skills/report/scripts/token-usage.mjs --runtime claude --task 'review-changes'
agy -p 'Review current changes' --output-format stream-json | node .agents/skills/report/scripts/token-usage.mjs --runtime antigravity --task 'review-changes'
```

Chạy pipeline chỉ khi task đó được yêu cầu; dùng `set -o pipefail` để không che lỗi Codex. Metadata repo/task/skill/command do người gọi gắn, không tự chứng minh log thuộc scope đó. Mỗi input chỉ chứa các lượt thuộc task, không trộn/replay event hoặc ghép log trùng. Thiếu usage phải giữ trạng thái thiếu/partial của script; không lấy tổng phần đã đo làm tổng cả task. Script nhận usage sau `turn.completed`, nên số của lượt hiện tại được bổ sung sau khi lượt kết thúc, không tự xuất hiện trong câu trả lời đang sinh. Dùng `--help` để xem option; không ghi raw log vào repo.

Claude/Antigravity: chỉ đọc kết quả `result`, giữ snapshot cuối của một phiên, không cộng nhiều snapshot tích lũy hoặc cộng thêm usage assistant/step/model. Dùng phiên mới dành riêng cho task để quy về task; phiên resumed phải ghi phạm vi phiên, không gán tổng đó cho task mới. Claude có cache read/creation input riêng nên cộng vào tổng input; Antigravity dùng input/output được runtime báo, không cộng thêm thinking/cache. Usage chỉ đo phần runtime xuất ra; không tự thêm subagent thiếu telemetry. Hỗ trợ CLI JSONL, không tự lấy số liệu từ app/IDE, SQLite hoặc quota phần trăm.

## Hook Claude sau chạy test

[test-token-usage](../../../hooks/scripts/test-token-usage.mjs) chạy sau lệnh test qua `Bash`, đọc `transcript_path` của phiên và gọi script với `--runtime claude-transcript`. Dùng subtotal trong `additionalContext` với nhãn **usage phiên ghi nhận một phần**, không ghi đó là tổng task/test. Script giữ usage cuối theo mỗi assistant message ID và loại message subagent; không cộng result snapshot vào các message. Transcript đang ghi có thể thiếu output usage, nên full total vẫn N/A; subtotal có số thực tế khi có dữ liệu. Hook không tự chạy trên Codex/Antigravity; thiếu transcript thì báo N/A. Xem [hướng dẫn hook](../../../hooks/README.md).
