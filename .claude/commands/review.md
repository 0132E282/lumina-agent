---
description: Review thay đổi hiện tại, snapshot repository/nhánh hoặc PR; tùy chọn comment PR và JSON file
argument-hint: "[repo [.|nhánh] | pr [URL|#số]] [--comment] [--file]"
---

Review phạm vi sau: $ARGUMENTS. Dùng skill `open-code-review:review` (OCR) khi runtime có.

Nếu runtime không có skill/plugin OCR, dùng vai trò [`reviewer-agent`](../agents/reviewer-agent.md) để review cùng phạm vi, báo rõ phương án đang dùng. Không yêu cầu cài plugin chỉ để thực hiện review thông thường; không báo đã chạy OCR nếu chưa chạy được.

Nếu đối tượng cần review là **kế hoạch (plan)** hoặc **test case** — không phải code — dùng agent [`reviewer-agent`](../agents/reviewer-agent.md) thay vì skill này (OCR chỉ review code; `reviewer-agent` mới có tiêu chí riêng cho plan/test case).

Nếu yêu cầu là **security review** chuyên sâu (lỗ hổng, xác thực/phân quyền, upload, thanh toán...) — dùng skill [`review-web-security`](../skills/review-web-security/SKILL.md) thay vì OCR (OCR review chất lượng code tổng quát, không có checklist bảo mật chuyên biệt).

## Phạm vi

- `/review`: mặc định staged + unstaged diff và code untracked hợp lệ trong working tree nhánh hiện tại. Loại secret/rác theo rule, chốt baseline HEAD và danh sách file; không có thay đổi thì báo không có diff, không tự review toàn repo.
- `/review repo` hoặc `/review repo .`: review toàn bộ code tracked tại HEAD của repo/nhánh hiện tại. `/review repo <nhánh>`: review snapshot code tại ref local/remote chỉ định. Xác minh ref/SHA, đọc module theo scope và ghi phần chưa đọc; không checkout/reset, không tự trộn thay đổi chưa commit vào snapshot. Thiếu repo/ref hoặc detached HEAD chưa rõ scope thì hỏi.
- `/review pr [URL|#số]`: review diff PR theo base/head SHA và merge-base thật. Không truyền target thì tìm PR đang mở của nhánh hiện tại; không có hoặc nhiều PR phù hợp thì hỏi chọn, không tự tạo PR. `#1` là PR 1, không có quy ước review nhánh bằng số 1.

## Đầu ra

- Mặc định trả kết quả qua chat bằng skill `report`, không tự lưu report/index hoặc đăng comment GitHub.
- `--comment`: chỉ dùng với `pr`, cho phép đăng findings vào **PR đã xác định**, không phải comment lên nhánh Git. Review xong dùng connector/`gh pr comment` thực tế với body-file/argument có cấu trúc, ghi scope/SHA và findings thật. Kiểm tra lại head SHA trước đăng; head đổi thì review phần mới hoặc báo bản cũ, không đăng như thể đã review bản mới. Báo URL comment, lỗi quyền/auth thì báo chưa đăng. Không tự approve/request-changes/merge.
- `--file`: lưu JSON đúng [template của workflow-review](../skills/workflow-review/assets/review-json-template.json) vào `docs/reviews/<title-slug>-<yyyyMMdd>.json`. Đọc index nếu có trước khi lưu, tạo khi thiếu; cập nhật `docs/reviews/index.json` với entry chỉ gồm `title`, `description`, `tags`, `path`. Không ghi đè report cũ ngoài phạm vi; trả đường dẫn file.
- Có thể kết hợp `pr --comment --file`; hai đầu ra phải cùng scope/SHA/findings. Option lạ hoặc `--comment` ngoài PR thì báo cú pháp và dừng. Truyền input dưới dạng argument riêng, không nội suy thành shell code.

## Kiểm chứng

Đọc context/code/rule thực tế; findings có vị trí, severity, bằng chứng, tác động, đề xuất và verification thật. Không bịa test/benchmark hoặc coi phần chưa đọc là đạt. Big O chỉ khi runtime/thuật toán liên quan, còn lại không áp dụng. Reviewer chỉ nêu vấn đề, không sửa code/plan/testcase, commit, push hoặc merge. Chỉ ghi file khi `--file`/yêu cầu lưu rõ, chỉ đăng comment khi `pr --comment`.
