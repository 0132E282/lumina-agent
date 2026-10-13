---
name: workflow-report
description: "Xuất báo cáo thay đổi (change report) cho các Edit/Write vừa thực hiện, dùng skill report"
---

# workflow-report

Đọc skill [`report`](../report/SKILL.md) và rule [`mandatory-report`](../../rules/mandatory-report.md), format kết quả/thay đổi đã có theo loại báo cáo đúng. Báo cáo là bước bắt buộc khi task có kết quả, không chờ command report; skill này chỉ là cách gọi riêng khi cần xuất lại kết quả đã có, không thực hiện review mới. Không có command report riêng. Code có xử lý runtime thì dùng complexity-performance trước report; config/docs/template thuần túy ghi Big O không áp dụng. Không bịa kiểm chứng.
