---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 🔀 Pull Request — Conflict Safety Gate"
---

# 🔀 Pull Request — Conflict Safety Gate

**Nhóm quy tắc kết hợp**: PR Safety Gate (điều kiện bắt buộc, không phải quy trình)

## Quy tắc

- Trước xử lý conflict với remote, lấy ref mới nhất bằng `git fetch` đúng remote/nhánh, chốt SHA trước/sau và merge-base. Không chạy `git pull` mù quáng làm merge/rebase ngoài thao tác được giao; fetch không đồng nghĩa đã tích hợp code. Lấy dữ liệu thất bại thì báo chưa cập nhật, không dùng ref cũ như mới.
- Ưu tiên theo thay đổi của người dùng so với merge-base, ở từng file/hunk: phần người dùng **không thay đổi** nhận bản incoming/remote; phần người dùng **đã thay đổi** và xung đột giữ bản người dùng. Giữ các thay đổi incoming không xung đột. Dùng diff/SHA làm căn cứ, không suy từ tên nhánh, timestamp hoặc tác giả commit; không chọn nguyên file ours/theirs nếu làm mất hunk độc lập.
- Trước tích hợp, xác định rõ phía chứa thay đổi của người dùng và phía incoming bằng SHA và scope task. Nếu có thay đổi chưa commit thì bảo vệ working tree/index và hỏi cách xử lý; không tự stash/reset/ghi đè. Trong rebase/cherry-pick, ours/theirs có thể khác ý nghĩa so với merge; không dùng nhãn đó thay cho xác định nội dung. Không đủ căn cứ về phía/thay đổi thì hỏi trước resolve.
- Trước khi tạo/cập nhật PR: **bắt buộc** kiểm tra nhánh có conflict với nhánh đích không.
- Nếu có conflict: **bắt buộc đọc cả hai phía** (`<<<<<<<` / `=======` / `>>>>>>>`) trước khi resolve — không bao giờ xóa một bên mà không xem nội dung.
- Nếu nghi ngờ việc resolve có thể làm mất một logic quan trọng không liên quan đến task của PR: **dừng lại và hỏi người dùng**, không tự quyết âm thầm.
- **Chỉ gộp đúng phần cần thiết để resolve conflict textual** — tuyệt đối không tự ý kéo thêm logic/tính năng từ nhánh đích (base, ví dụ `main`) vào nhánh nguồn nếu người dùng chưa yêu cầu rõ việc đó, kể cả khi thấy logic đó "có vẻ cần" hoặc "nên có cho đủ". Nhiệm vụ chỉ giới hạn ở nhánh/task được giao — thấy thiếu gì từ nhánh khác thì **báo cho người dùng biết và hỏi**, không tự gộp vào.

## Khi áp dụng

- Mỗi lần chuẩn bị tạo hoặc cập nhật PR mà git báo conflict.

> Đây là **điều kiện bắt buộc phải tuân thủ**, không phải hướng dẫn từng bước. Quy trình resolve chi tiết — ưu tiên giữ nhánh nào, checklist — nằm ở skill [`git-workflow`](../skills/git-workflow/SKILL.md).
