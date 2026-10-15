---
name: report
description: "Báo cáo kết quả đã có khi hoàn thành task hoặc gọi /report, $workflow-report; ghi input/output/tổng token và phạm vi đo, thiếu số liệu ghi N/A. Không tự review hay phân tích code."
license: MIT
metadata:
  version: "1.7"
---

# Report

Khi scope là toàn plan/nhóm task coding, gom bàn giao nội bộ, thay đổi plan và kiểm chứng để gửi **một báo cáo cuối sau khi tất cả task được giao hoàn thành**. Trước đó chỉ cập nhật tiến độ ngắn; không xuất report giữa các task. Báo cáo cuối gộp thay đổi theo file, trạng thái task/AC, checks thật, Big O, giới hạn và một mục token đúng phạm vi; không lặp report/token của từng agent. Chưa hoàn tất vì blocker cần người dùng thì báo blocker và phần còn lại, không dùng kết luận DONE. Yêu cầu `/report` khi chưa xong chỉ xuất trạng thái chưa hoàn thành, không giả báo cáo hoàn tất.

Chỉ trình bày kết quả/diff đã có; không tự tìm lỗi, review, kiểm thử hay đánh giá code. Mặc định ngắn gọn, đúng template; không bỏ field bắt buộc. Áp dụng theo [mandatory-report](../../rules/mandatory-report.md) và [quality-assurance](../../rules/quality-assurance.md).

## Chọn template

| Loại | Input và thời điểm | Template |
|---|---|---|
| Thay đổi/commit | Diff sau Edit/Write hoặc trước khi soạn commit | [Change](./assets/change-report-template.md) |
| Plan | Plan JSON vừa hoàn thành, trước khi chờ duyệt | [Plan](./assets/plan-summary-report-template.md) |
| Review | Finding đã có từ review code, plan hoặc testcase | [Review](./assets/review-report-template.md) |
| Security | Kết quả review-web-security | [Security](./assets/security-review-report-template.md) |
| Dependency | Kết quả dependency-audit | [Dependency](./assets/dependency-audit-report-template.md) |
| Test | Kết quả QA đã thiết kế/thực thi | [QA digest](./assets/qa-test-report-template.md) |
| Bug/Feedback | Phát hiện trong lúc làm việc | [Feedback](./assets/bug-feedback-report-template.md) |

## Yêu cầu theo loại

- **Change**: template là nguồn chuẩn định dạng; chỉ nêu thay đổi thực tế và vấn đề được giải quyết, không diễn giải lại file. Code phụ thuộc dữ liệu dùng [complexity-performance](../complexity-performance/SKILL.md); có query/database kết hợp [database](../database/SKILL.md). Giữ kiểm chứng, giới hạn, đánh giá; rule/skill/docs/config thuần túy ghi Big O không áp dụng. Chỉ thêm code cũ/mới khi được yêu cầu.
- **Plan**: tóm tắt số REQ/task/câu hỏi mở/rủi ro, rủi ro chính và bước tiếp theo; không chép toàn bộ plan. Có từ hai câu hỏi mở thì dùng bảng theo [open-questions-table](../../rules/open-questions-table.md).
- **Review**: dùng text, không pipe-table; giữ các field và thống kê trong template. Severity: CRITICAL (logic nặng/bảo mật/crash), WARNING (code smell/hiệu năng/edge case), SUGGESTION (gợi ý), GOOD (điểm tốt). Code phụ thuộc dữ liệu ghi time/space Before/After, input, query/API/I/O và preprocessing; ngoài runtime ghi N/A.
- **Security**: giữ đủ chín field theo [review-web-security](../review-web-security/SKILL.md), gồm confidence, điều kiện khai thác và CWE/OWASP; không gộp vào review thường.
- **Dependency**: giữ package, severity, phiên bản hiện tại → fix, loại thay đổi và lệnh đề xuất; không tự thực thi lệnh sửa.
- **Test**: chỉ tóm tắt kết quả QA; không thay thế ma trận bao phủ hoặc bug report chi tiết, không suy đoán Pass/Fail.
- **Feedback**: ba dòng `Title: [Type] tiêu đề`, `URL: vị trí hoặc chưa xác định`, `Description: hiện tượng + đã làm gì`. Type tự do; không thay thế bug report QA hay tool SendFeedback.

Dấu phân cách và bố cục theo template tương ứng. Báo cáo sau khi công việc nguồn hoàn tất; feedback ghi ngay khi phát hiện.

## Token sử dụng

Cuối mọi báo cáo task, thêm một dòng `Token: input <số> | output <số> | tổng <số> | phạm vi <repo/task/skill/command> | nguồn <usage runtime>`. Chỉ dùng usage thực tế do runtime cung cấp; field không có ghi `N/A`. Không suy token từ số ký tự, độ dài context, output tool hoặc token budget. Tổng chỉ ghi khi runtime cung cấp hoặc cộng được input/output cùng phạm vi, cùng cách đếm; cached/reasoning token là thành phần con khi runtime quy định, không cộng trùng.

Ghi đúng phạm vi đo: task hiện tại, một lượt hoặc toàn phiên; không gán usage toàn phiên cho riêng task/repo/skill/command. Nếu gồm subagent, chỉ cộng usage riêng không trùng của cùng task và nêu phần thiếu. Không có telemetry thì ghi `Token: N/A — runtime không cung cấp usage cho task này.` Không tự đọc log phiên khác/credential hoặc cài công cụ chỉ để lấy token. Xuất lại report dùng số liệu đã ghi với phạm vi cũ; không tự cộng thêm hoặc coi đó là usage của lần xuất lại.

Ưu tiên số liệu có thật: nếu chưa có tổng task nhưng có snapshot phiên hoặc subtotal quan sát được, báo `Token phiên (snapshot): input ... | output ... | tổng ...` hoặc `Token quan sát (một phần): ...`, kèm nguồn/phạm vi và giới hạn. Không bỏ số liệu có sẵn rồi chỉ ghi N/A. Chỉ ghi N/A khi đã kiểm tra nguồn phù hợp mà không có usage; phân biệt chưa chạy collector, không có path/quyền, schema không hỗ trợ và telemetry chưa ghi, không mặc định kết luận runtime không cung cấp. API [Claude count_tokens](https://platform.claude.com/docs/en/build-with-claude/token-counting) chỉ ước lượng input trước request, không thay usage thực tế hoặc output token.

### Phiên Codex hiện tại

```bash
node .agents/skills/report/scripts/token-usage.mjs --runtime codex-rollout --current-session --task 'current-task'
```

Chỉ khi cần báo usage phiên hiện tại: `--current-session` chọn đúng rollout theo `CODEX_THREAD_ID` trong `$CODEX_HOME/sessions` (mặc định `~/.codex/sessions`). Không có ID/file hoặc nhiều file khớp thì báo giới hạn, không chọn phiên khác. Script chỉ đọc file khớp, lấy snapshot `token_count.info.total_token_usage` cuối, không cộng nhiều snapshot hoặc cached/reasoning token. Đây là tổng phiên tại thời điểm đọc, không phải tổng riêng task hay câu trả lời đang sinh; `last_usage` chỉ là request cuối được ghi. Có thể dùng `--input` với rollout chỉ định thay vì `--current-session`; không dùng cả hai.

### Codex, Claude Code và Antigravity CLI

Dùng [token-usage.mjs](./scripts/token-usage.mjs) với `--runtime codex|claude|antigravity` (mặc định codex) và stream/file JSONL được chọn. Script chỉ đọc usage, không chạy task hay gọi API. Schema nguồn: [Codex](https://learn.chatgpt.com/docs/non-interactive-mode), [Claude Code](https://code.claude.com/docs/en/agent-sdk/cost-tracking), [Antigravity CLI](https://antigravity.google/docs/cli/headless/).

```bash
codex exec --json 'Review current changes' | node .agents/skills/report/scripts/token-usage.mjs --task 'review-changes' --skill workflow-review --command review
node .agents/skills/report/scripts/token-usage.mjs --input /path/to/task.jsonl --task 'review-changes' --format json
claude -p 'Review current changes' --output-format stream-json --verbose | node .agents/skills/report/scripts/token-usage.mjs --runtime claude --task 'review-changes'
agy -p 'Review current changes' --output-format stream-json | node .agents/skills/report/scripts/token-usage.mjs --runtime antigravity --task 'review-changes'
```

Chạy pipeline chỉ khi task đó được yêu cầu; dùng `set -o pipefail` để không che lỗi Codex. Metadata repo/task/skill/command do người gọi gắn, không tự chứng minh log thuộc scope đó. Mỗi input chỉ chứa các lượt thuộc task, không trộn/replay event hoặc ghép log trùng. Thiếu usage phải giữ trạng thái thiếu/partial của script; không lấy tổng phần đã đo làm tổng cả task. Script nhận usage sau `turn.completed`, nên số của lượt hiện tại được bổ sung sau khi lượt kết thúc, không tự xuất hiện trong câu trả lời đang sinh. Dùng `--help` để xem option; không ghi raw log vào repo.

Claude/Antigravity: chỉ đọc kết quả `result`, giữ snapshot cuối của một phiên, không cộng nhiều snapshot tích lũy hoặc cộng thêm usage assistant/step/model. Dùng phiên mới dành riêng cho task để quy về task; phiên resumed phải ghi phạm vi phiên, không gán tổng đó cho task mới. Claude có cache read/creation input riêng nên cộng vào tổng input; Antigravity dùng input/output được runtime báo, không cộng thêm thinking/cache. Usage chỉ đo phần runtime xuất ra; không tự thêm subagent thiếu telemetry. Hỗ trợ CLI JSONL, không tự lấy số liệu từ app/IDE, SQLite hoặc quota phần trăm.

### Hook Claude sau chạy test

[test-token-usage](../../hooks/scripts/test-token-usage.mjs) chạy sau lệnh test qua `Bash`, đọc `transcript_path` của phiên và gọi script với `--runtime claude-transcript`. Dùng subtotal trong `additionalContext` với nhãn **usage phiên ghi nhận một phần**, không ghi đó là tổng task/test. Script giữ usage cuối theo mỗi assistant message ID và loại message subagent; không cộng result snapshot vào các message. Transcript đang ghi có thể thiếu output usage, nên full total vẫn N/A; subtotal có số thực tế khi có dữ liệu. Hook không tự chạy trên Codex/Antigravity; thiếu transcript thì báo N/A. Xem [hướng dẫn hook](../../hooks/README.md).
