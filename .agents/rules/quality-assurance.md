---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: ✅ Chất lượng — Test + Static Analysis + Code Review"
---

# ✅ Chất lượng — Test + Static Analysis + Code Review

**Nhóm quy tắc kết hợp**: Test + Static Analysis + Code Review

## Cách áp dụng

- **Test luồng quan trọng**: ưu tiên business logic, edge case, luồng ảnh hưởng tiền/dữ liệu nhạy cảm — không cần cover 100%, nhưng không bỏ qua luồng rủi ro cao.
- **Static analysis** (linter/type checker) để bắt lỗi kiểu dữ liệu và code smell **trước khi** chạy thử — bắt buộc trước khi báo hoàn thành.
- **Code review**: thay đổi đáng kể nên được review lại (tự review nếu không có người khác) — kiểm tra đúng phạm vi, đúng chuẩn, không phá vỡ hành vi hiện có.
- Sửa bug → **viết test tái hiện bug trước khi fix** — đảm bảo bug không quay lại (regression test).
- **Phạm vi kiểm tra tương xứng task**: chọn mức kiểm tra nhỏ nhất đủ cho đúng hành vi/contract vừa đổi — không mặc định chạy toàn bộ test suite/E2E cho mọi thay đổi nhỏ. Full suite, full E2E, hoặc kiểm tra tổng hợp chỉ khi người dùng yêu cầu rõ hoặc có gate release/CI áp dụng.
- Khi kiểm thử theo module/tính năng, áp dụng rule [`black-box-feature-testing`](../rules/black-box-feature-testing.md) cho thiết kế hộp đen, lập lịch và đối soát case; không tự tạo quy tắc song song khác ở rule chung này.
- Nếu repository có `docs/testcases/index.json`, đọc trước khi thiết kế/chạy; lưu testcase và kết quả thực tế vào đó, giữ ID/history và không ghi Pass/Fail nếu chưa có bằng chứng.
- Review code hoặc system design cần lưu hồ sơ thì ghi JSON dưới `docs/reviews/` và cập nhật `docs/reviews/index.json`; không sửa artifact đang review.
- Người dùng nói rõ không cần test/check → tôn trọng, không lách qua bằng cách đổi lệnh hay tự chạy ngầm. Luôn nói rõ đã kiểm tra gì và còn thiếu/chưa kiểm tra gì.

### Checklist trước khi hoàn thành

- [ ] Luồng chính và edge case quan trọng đã có test?
- [ ] Không có lỗi linter/type checker?
- [ ] Test hiện có vẫn pass (không phá vỡ tính năng cũ)?
- [ ] Đã tự review lại diff trước khi báo cáo xong?

## Khi áp dụng

- Trước khi báo "hoàn thành task" — bước bắt buộc cuối cùng, không bỏ qua kể cả khi gấp.
- Ngay sau khi fix một bug — thêm test khóa lại hành vi đúng.
