---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: ✅ Chất lượng — Test + Static Analysis + Code Review"
---

# ✅ Chất lượng — Test + Static Analysis + Code Review

**Nhóm quy tắc kết hợp**: Test + Static Analysis + Code Review

## Cách áp dụng

- **Test luồng quan trọng**: ưu tiên business logic, edge case, luồng ảnh hưởng tiền/dữ liệu nhạy cảm — không cần cover 100%, nhưng không bỏ qua luồng rủi ro cao.
- **Static analysis** (linter/type checker) để bắt lỗi kiểu dữ liệu và code smell **trước khi** chạy thử — bắt buộc trước khi báo hoàn thành.
- Kiểm tra newline cuối các file text mới/sửa trước bàn giao hoặc commit, gồm JSON/index/docs/config. Dùng `node .agents/hooks/scripts/ensure-final-newline.mjs --check <file...>` với danh sách file thật trong scope và `git diff --check`; `git diff --check` một mình không chứng minh có newline cuối file. Có lỗi thì sửa đúng file và kiểm tra lại. Claude có hook sau Edit/Write; Codex/Antigravity phải chạy check thực tế, không giả lập hook. Repo chưa có script thì dùng formatter/checker sẵn có hoặc kiểm tra byte cuối; không tự cài dependency.
- **Code review**: thay đổi đáng kể nên được review lại (tự review nếu không có người khác) — kiểm tra đúng phạm vi, đúng chuẩn, không phá vỡ hành vi hiện có.
- Trước khi hoàn thành task code, kiểm tra diff và đường chạy bị ảnh hưởng để phát hiện thay đổi component/page ngoài yêu cầu, vòng lặp render/state/effect, và N+1 query/API call do thay đổi gây ra. Kiểm tra xuyên stack, không phụ thuộc framework: request frontend lặp theo từng item; backend/ORM lazy-load quan hệ trong vòng lặp; query phát sinh theo từng record ở Laravel, EF/SQL hoặc ORM khác.
- Với luồng backend/data access bị ảnh hưởng, đếm số query cho một request/job với tập dữ liệu có nhiều record bằng query log/profiler/test instrumentation sẵn có; kiểm tra số query có tăng theo số record không. Với frontend, kiểm tra network/API call có bị nhân theo số item không. Nếu môi trường không có công cụ đo, rà code path tĩnh và ghi rõ chưa đo được số thực tế. Chỉ rà luồng liên quan task, không biến bước này thành audit toàn hệ thống.
- Nếu lỗi nằm ngoài phạm vi và đã tồn tại từ trước, không tự sửa; báo vị trí/tác động và xin người dùng chấp thuận. Nếu lỗi do diff hiện tại gây ra hoặc thuộc hành vi được giao, sửa và kiểm tra lại trước khi hoàn thành.
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
- [ ] Đã rà phạm vi component/page, vòng lặp render/state/effect và N+1 xuyên stack; đã đếm query/request hoặc ghi rõ chỉ kiểm tra tĩnh?
