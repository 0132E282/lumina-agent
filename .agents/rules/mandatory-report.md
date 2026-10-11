---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 📊 Báo cáo bắt buộc — Qua skill report, mặc định ngắn gọn"
---

# 📊 Báo cáo bắt buộc — Qua skill `report`, mặc định ngắn gọn

**Phạm vi**: áp dụng cho **mọi** tác vụ hoàn thành (code, plan, review, test, audit...) — cả phiên chính khi tự `Edit`/`Write` trực tiếp (không qua subagent), và mọi subagent (`coding-agent`, `planner-agent`, `reviewer-agent`, `qa-tester-agent`, `workspace-auditor-agent`...).

## Cách áp dụng

- Hoàn thành một task có thay đổi/kết quả cụ thể → **bắt buộc xuất báo cáo bằng skill [`report`](../skills/report/SKILL.md)**, đúng loại tương ứng (change/plan/review/security/dependency/test) — không tự trình bày theo format tự do khác, không bỏ qua report rồi chỉ báo "xong".
- **Mặc định báo cáo ngắn gọn**: dùng đúng khung của template skill report. Review report dùng format text `File/Type/Severity/Big O/Chi tiết`; change report và các loại khác giữ template tương ứng — không tự mở rộng thêm mục "Chi tiết thay đổi" khi người dùng chưa yêu cầu.
- Chỉ viết phần chi tiết khi người dùng yêu cầu rõ ("chi tiết hơn", "xem code cụ thể", "giải thích kỹ phần nào") — không suy đoán người dùng muốn chi tiết.
- Áp dụng kể cả khi phiên chính tự `Edit`/`Write` trực tiếp mà không giao qua subagent — không chỉ riêng `coding-agent`/`planner-agent`.
- **Không áp dụng** khi task chỉ là trả lời câu hỏi/tra cứu thông tin, không có thay đổi/kết quả cần báo cáo.

```markdown
<!-- ❌ Sửa xong, báo "xong" bằng câu tóm tắt tự do, không dùng skill report -->
Đã sửa file X, thêm field Y, mọi thứ hoạt động tốt.

<!-- ✅ Dùng khung report skill, ngắn gọn, chỉ mở rộng khi được hỏi -->
## 📝 Báo cáo thay đổi
Tổng số file đã sửa: 1 file (1 sửa)
| Trạng thái | File | Ghi chú |
|---|---|---|
| Sửa | `path/to/X` | Thêm field Y |
```

## Khi áp dụng

- Ngay sau khi `Edit`/`Write` hoàn tất một task code — dù phiên chính tự làm hay giao `coding-agent`.
- Ngay sau khi `planner-agent` viết xong plan ([`rules/plan-format`](./plan-format.md)).
- Ngay sau khi `reviewer-agent`/`qa-tester-agent`/`workspace-auditor-agent` hoàn tất việc được giao.
- Trước khi báo "hoàn thành task" với người dùng — tự hỏi: *"đã xuất report bằng skill `report` chưa, hay đang tự diễn giải?"*
