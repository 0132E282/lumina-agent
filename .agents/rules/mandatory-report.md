---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 📊 Báo cáo bắt buộc — Qua skill report, mặc định ngắn gọn"
---

# 📊 Báo cáo bắt buộc — Qua skill `report`, mặc định ngắn gọn

**Phạm vi**: áp dụng cho **mọi** tác vụ hoàn thành (code, plan, review, test, audit...) — cả phiên chính khi tự `Edit`/`Write` trực tiếp (không qua subagent), và mọi subagent (`coding-agent`, `planner-agent`, `reviewer-agent`, `qa-tester-agent`, `workspace-auditor-agent`...).

## Cách áp dụng

- Hoàn thành một task có thay đổi/kết quả cụ thể → **bắt buộc xuất báo cáo bằng skill [`report`](../skills/report/SKILL.md)**, đúng loại tương ứng (change/plan/review/security/dependency/test) — không tự trình bày theo format tự do khác, không bỏ qua report rồi chỉ báo "xong".
- **Mặc định báo cáo ngắn gọn**: dùng skill report; phần liệt kê file/mục trong báo cáo repo dùng text theo mẫu dưới đây, mỗi file/mục một khối, không dùng bảng. Ghi đúng nhãn `Path`, `Title`, `Description`; `Path` là đường dẫn thực tế trong repo, `Title` là tiêu đề ngắn, `Description` mô tả nội dung hoặc thay đổi. Quy định này ưu tiên hơn phần liệt kê dạng bảng trong template skill report.
- Các phần kiểm chứng, Big O, đánh giá và field chuyên biệt của từng loại report vẫn phải giữ khi áp dụng; không tự mở rộng thêm mục "Chi tiết thay đổi" khi người dùng chưa yêu cầu.
- Mỗi khối có dòng phân cách gồm 80 dấu `-` ở cả trên và dưới. Khi xuất báo cáo, đặt khối trong code fence `text` để giữ nguyên dòng gạch và xuống dòng.
- Chỉ viết phần chi tiết khi người dùng yêu cầu rõ ("chi tiết hơn", "xem code cụ thể", "giải thích kỹ phần nào") — không suy đoán người dùng muốn chi tiết.
- Áp dụng kể cả khi phiên chính tự `Edit`/`Write` trực tiếp mà không giao qua subagent — không chỉ riêng `coding-agent`/`planner-agent`.
- **Không áp dụng** khi task chỉ là trả lời câu hỏi/tra cứu thông tin, không có thay đổi/kết quả cần báo cáo.

```markdown
<!-- ❌ Sửa xong, báo "xong" bằng câu tóm tắt tự do, không dùng skill report -->
Đã sửa file X, thêm field Y, mọi thứ hoạt động tốt.

<!-- ✅ Báo cáo repo dạng text, mỗi file/mục một khối -->
--------------------------------------------------------------------------------
Path: path/to/X
Title: Thêm field Y
Description: Bổ sung field Y để đáp ứng yêu cầu dữ liệu.
--------------------------------------------------------------------------------
```
