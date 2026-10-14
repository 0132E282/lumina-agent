---
name: report
description: "Báo cáo kết quả đã có khi hoàn thành task hoặc gọi /report, $workflow-report; ghi input/output/tổng token và phạm vi đo, thiếu số liệu ghi N/A. Không tự review hay phân tích code."
license: MIT
metadata:
  version: "1.7"
---

# Report

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
