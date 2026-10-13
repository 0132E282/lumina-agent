---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 🖥️ Frontend — Đúng mẫu + Trải nghiệm + Nội dung"
---

# 🖥️ Frontend — Đúng mẫu + Trải nghiệm + Nội dung

**Nhóm quy tắc kết hợp**: Design Fidelity + Semantic HTML + Accessible Content Rendering

## Cách áp dụng

- **Bám UI/Figma đã có**: đọc đúng màn hình, component, token và asset trước khi code; xác định nguồn chuẩn nếu mẫu và UI khác nhau. Không có yêu cầu redesign thì giữ layout, màu, font, spacing và tương tác; không tự tạo design system, đổi theme/UI library hoặc dùng skill phong cách để ghi đè mẫu. Thêm trang/tính năng phải kế thừa mẫu; không đọc được mẫu thì nêu rõ, không đoán.
- **Theo stack và contract thật**: tái sử dụng component, route, data fetching và state hiện có; không tạo global state/abstraction khi chưa cần. Không dùng dữ liệu giả để che API lỗi hoặc tự đổi content đã duyệt.
- **Khoanh phạm vi UI**: chỉ sửa component/page và hành vi cần thiết cho yêu cầu. Giữ nguyên các luồng, trạng thái, layout và hành vi hiện có ngoài phạm vi. Nếu cần chỉnh component/page dùng chung hoặc hành vi đang hoạt động bên ngoài yêu cầu, phải nêu tác động và xin người dùng chấp thuận trước khi sửa; không suy diễn sự đồng ý từ việc đó là cách triển khai tiện hơn.
- **HTML đúng vai trò**: landmark/heading theo cấu trúc nội dung; điều hướng dùng anchor có `href` thật, thao tác dùng button với `type` phù hợp. Không dùng div click hoặc link giả thay native control.
- **Responsive và accessibility**: nội dung dễ đọc trên mobile/tablet/desktop, không tràn toàn trang. Label gắn input, alt đúng chức năng, keyboard/focus rõ và dialog quản lý focus; lỗi không chỉ thể hiện bằng màu. Giữ contrast và reduced motion.
- **Đủ trạng thái**: xử lý loading, empty, success, error/retry, validation và pending submit khi áp dụng. Giữ dữ liệu form khi lỗi, tránh submit lặp và response cũ ghi đè dữ liệu mới; lỗi widget trang trí không làm mất nội dung chính.
- **Render và metadata đúng trang**: xác định CSR/SSR/SSG theo stack và nhu cầu; không tự rewrite kiến trúc render. Trang công khai cần SEO có nội dung/link crawler truy cập được; title, description, canonical, robots và Open Graph dùng dữ liệu từng route, không trùng hoặc giữ dữ liệu trang trước. Tránh hydration mismatch và browser API trong server code.
- **URL truy cập trực tiếp được**: kiểm tra deep link, refresh, back/forward, breadcrumb và phân trang. Trang không tồn tại hiển thị đúng, phối hợp router/server để trả status phù hợp; không dùng UI ẩn quyền thay bảo vệ backend.
- **Ảnh và hiệu năng**: dùng kích thước/định dạng phù hợp, giữ chỗ bằng width/height hoặc aspect ratio. Lazy-load ảnh ngoài viewport, không lazy-load ảnh hero/LCP; tránh script nặng không cần thiết, đo trước khi kết luận cải thiện.
- **Nội dung an toàn**: escape text; HTML CMS/API phải được sanitize đúng trust boundary bằng thư viện phù hợp, không chèn raw HTML hoặc tự lọc bằng regex. Kiểm soát URL nguy hiểm, serialize JSON-LD an toàn; không lộ secret trong bundle/HTML.

## Kiểm chứng

Đối chiếu mẫu UI, thử nội dung dài/thiếu dữ liệu, keyboard, form và lỗi API; kiểm tra nhiều kích thước màn hình, route trực tiếp và metadata khi liên quan. Chạy test/lint/type check/build phù hợp theo [quality-assurance](./quality-assurance.md); phân biệt check pass/fail/chưa chạy, không coi local preview là bằng chứng đã index hoặc đạt hiệu năng production.

## Khi áp dụng

Khi viết, sửa hoặc review frontend. SEO/Open Graph áp dụng cho trang công khai phù hợp, không tự index admin/nội dung riêng tư. Quy trình chi tiết ở [coding-frontend](../skills/coding-frontend/SKILL.md); TypeScript tuân thủ [type-safety](./type-safety.md).
