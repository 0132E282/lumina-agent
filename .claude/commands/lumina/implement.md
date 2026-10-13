---
description: Triển khai code bằng agent coding-agent theo đúng phạm vi được giao (task cụ thể hoặc plan JSON trong docs/plans/)
argument-hint: "<task/tính năng cần code, hoặc 'theo plan' để chọn plan phù hợp trong docs/plans/>"
---

Giao cho agent `coding-agent` triển khai: $ARGUMENTS

- Nếu người dùng yêu cầu triển khai theo plan mà không chỉ định task cụ thể, đọc `docs/plans/index.json`, tìm theo title/description/tags, mở plan JSON liên quan qua `path`, rồi đọc task `TODO`/`IN_PROGRESS`, `filesToChange` và dependency — triển khai đúng task được giao theo thứ tự dependency.
- Tuân thủ toàn bộ 18 rule bắt buộc trong [`rules/`](../../rules) — không tự ý mở rộng phạm vi, không refactor ngoài task, không tự thêm tính năng.
- Chỉ sửa component/page/module và hành vi cần thiết cho yêu cầu hoặc task đã duyệt; bảo toàn các hành vi đang hoạt động ngoài phạm vi. Nếu muốn/ cần thay đổi ngoài phạm vi, dừng phần đó và xin người dùng chấp thuận trước, nêu rõ file và tác động. Tiếp tục phần độc lập đã được giao.
- Trước khi bàn giao, đối chiếu từng file/hunk của diff với yêu cầu; bỏ thay đổi do mình tạo không thuộc phạm vi. Không coi Boy Scout, dọn dẹp, đồng bộ UI hoặc test pass là sự cho phép mở rộng.
- Trên luồng bị ảnh hưởng, kiểm tra N+1 xuyên stack: API call lặp theo item ở frontend và query/lazy-load lặp theo record ở backend/ORM (Laravel/Eloquent, EF/SQL hoặc công nghệ tương ứng); đếm query/request bằng công cụ sẵn có hoặc ghi rõ chỉ kiểm tra tĩnh. Kiểm tra thêm render/state/effect loop trên framework đang dùng. Chỉ sửa lỗi do thay đổi hiện tại gây ra hoặc nằm trong yêu cầu; lỗi cũ ngoài phạm vi phải báo vị trí/tác động và xin chấp thuận trước.
- Chỉ sau khi coding xong toàn bộ task của plan, tạo tài liệu testcase cấp repo dạng Markdown trong `docs/repo/<title-slug>-<yyyyMMdd>.md`, dựa trên code/luồng thực tế. Đây chỉ là thiết kế testcase, ghi `Not Run`; không tự chạy bộ testcase repo này. Cập nhật cả `docs/repo/index.json` (mục lục con) và `docs/index.json` với entry chỉ gồm title/description/tags/path.
- Sau khi code xong: chạy test/lint liên quan, kiểm tra README/CLAUDE.md/docs có đoạn nào nhắc tới phần vừa đổi mà giờ sai không — có thì cập nhật luôn (dùng skill `docs` nếu phạm vi lớn/không chắc hết chỗ — [`rules/docs-sync`](../../rules/docs-sync.md)), rồi xuất báo cáo thay đổi (skill `report`), và dừng lại chờ người dùng xác nhận trước khi `reviewer-agent` review hoặc commit.
