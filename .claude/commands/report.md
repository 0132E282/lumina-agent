---
description: "Xuất lại kết quả task đã có; ghi input/output/tổng token và phạm vi đo, thiếu số liệu ghi N/A."
argument-hint: "[task/phạm vi]"
---

Xuất báo cáo cho phạm vi: $ARGUMENTS. Không có argument thì dùng task vừa hoàn thành trong repo hiện tại; có argument chỉ dùng kết quả đã có thuộc phạm vi đó. Thiếu dữ liệu thì nêu rõ, không tự chạy task/review/test mới.

Đọc và dùng skill [`report`](../skills/report/SKILL.md), theo rule [`mandatory-report`](../rules/mandatory-report.md). Giữ báo cáo ngắn, kiểm chứng thật và dòng token cuối báo cáo theo đúng phạm vi telemetry; runtime không cung cấp usage thì ghi N/A, không ước lượng. Mặc định trả chat, không tự lưu file/đăng ngoài hoặc commit. Codex dùng `$workflow-report` tương đương.
