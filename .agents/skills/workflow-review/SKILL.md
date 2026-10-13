---
name: workflow-review
description: "Review thay đổi chưa commit, snapshot repository/nhánh hoặc PR; trả chat mặc định, đăng comment PR với --comment, xuất JSON với --file."
---

# workflow-review

Đọc nguồn `.claude/commands/review.md`, truyền argument người dùng và giải quyết link từ `.claude/commands/`. Claude dùng `/review`; Codex dùng `$workflow-review` với cùng argument.

- Không argument: review staged/unstaged diff và code untracked hợp lệ của working tree nhánh hiện tại.
- `repo [.|nhánh]`: review toàn bộ snapshot code tracked tại HEAD hoặc ref chỉ định, không checkout/trộn diff chưa commit.
- `pr [URL|#số]`: review PR tại base/head SHA đã chốt; thiếu target thì tìm PR nhánh hiện tại, nhiều/không có thì hỏi.
- Mặc định trả chat. `pr --comment` cho phép đăng comment vào PR cụ thể; `--file` cho phép lưu JSON theo [template](./assets/review-json-template.json) và cập nhật index. Không tự đăng/lưu.

Dùng OCR khi có hoặc reviewer-agent fallback theo workflow; giữ vai trò chỉ review, không sửa artifact. Khi runtime hỗ trợ delegation thì dùng agent cùng vai trò được giao; thiếu thì làm tuần tự cùng scope và báo giới hạn. JSON finding có `id`, `severity` (`CRITICAL|WARNING|SUGGESTION|GOOD`), `location`, `evidence`, `impact`, `recommendation`, `verification`, `bigO` khi áp dụng. Verification ghi lệnh/bằng chứng/kết quả thật; chưa chạy ghi `Not Run`. Không để placeholder template trong report đã xuất; null chỉ dùng cho field không áp dụng/chưa xác định và ghi giới hạn.

Không giả lập OCR/comment/tool; trả kết quả bằng skill `report`. Security review giữ field chuyên biệt của template security khi cần bổ sung.
