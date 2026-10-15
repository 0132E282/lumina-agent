---
trigger: model_decision
description: "Áp dụng khi clone website/reference và cần bảo toàn asset, CSS, media hoặc pixel fidelity"
---

# Clone fidelity — Asset provenance, CSS và media

- Chốt source of truth, route, viewport và trạng thái trước khi triển khai. Tách dữ kiện đã quan sát khỏi giả định; không ghi nhận pixel-perfect nếu chưa đối chiếu cùng viewport/trạng thái.
- Mọi asset tải về phải có mapping truy vết `originUrl` → `localPath`, trạng thái, loại tài nguyên và lỗi nếu có. Không thay thế URL chưa tải thành placeholder hoặc URL không xác minh.
- Giữ CSS gốc ở dạng file riêng khi có thể; thay URL bằng mapping đã xác minh, giữ thứ tự stylesheet và selector. Không dùng regex để sửa nội dung CSS phức tạp nếu thao tác đó có thể làm hỏng chuỗi, data URI hoặc `@import`.
- Video, iframe, stream manifest và asset lớn phải có trạng thái riêng. Không tự tải/ghép stream `.m3u8`, không bỏ qua `poster`, `source`, `track` hoặc `srcset`; ghi rõ phần cần xử lý thủ công.
- Inject CSS/media phải idempotent: chạy lại không nhân đôi thẻ `<link>`, `<style>` hoặc nguồn media. Không ghi đè layout nguồn; dùng file output riêng.
- Pixel spec chỉ chứa giá trị đo/quan sát được: màu, font, kích thước, line-height, spacing, container, breakpoint, shadow, transition và trạng thái. Giá trị chưa đo phải để `TBD`/`Unverified`, không bịa mã màu hoặc kích thước.
- Tuân thủ giới hạn cùng-origin, kích thước file, timeout và quyền truy cập. Host ngoài, authentication, CAPTCHA, paywall hoặc stream cần quyền/giải pháp riêng thì dừng và báo blocker.
