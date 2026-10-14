---
trigger: model_decision
description: "Hoàn thành task có kết quả cụ thể: dùng skill report, mặc định ngắn gọn"
---

# Báo cáo bắt buộc

- Mọi agent, kể cả phiên chính tự sửa cấu hình/docs, phải dùng [report](../skills/report/SKILL.md) khi hoàn thành task có thay đổi/kết quả cụ thể.
- Chọn đúng loại từ kết quả đã có; report không thay thế review, phân tích hay kiểm thử.
- Báo cáo thay đổi theo [template nguồn chuẩn](../skills/report/assets/change-report-template.md): mỗi file có `Path`, chỉ nhóm hành động thực tế, không dùng bảng, `Title` hoặc `Description`.
- Mặc định ngắn gọn: thay đổi chính, kiểm chứng, giới hạn và đánh giá; giữ Big O và field chuyên biệt khi áp dụng. Chỉ thêm giải thích sâu/code cũ-mới khi được yêu cầu.
- Không áp dụng cho trả lời câu hỏi/tra cứu đơn thuần không có kết quả cần báo cáo.
