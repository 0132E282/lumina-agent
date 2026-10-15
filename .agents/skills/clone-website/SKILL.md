---
name: clone-website
description: Clone an existing website or supplied website reference with structural and visual fidelity. Use when the user provides a live URL, screenshot, recording, HTML, or design reference and asks to reproduce the site; do not use for redesigning, restyling, or inventing a new UI.
license: MIT
metadata:
  version: "1.1"
---

# Clone Website

Nếu người dùng không yêu cầu khác, mặc định phải clone giống 100% từng pixel theo nguồn. Chỉ ghi nhận đạt pixel-perfect sau khi đã đối chiếu thực tế cùng viewport và trạng thái; không được đoán phần chưa kiểm chứng.

Tái tạo website theo đúng nguồn tham chiếu được người dùng cung cấp. Nguồn tham chiếu là source of truth cho cấu trúc, bố cục, nội dung hiển thị, typography, màu sắc, spacing, asset, responsive behavior và tương tác quan sát được.

## Ràng buộc bất biến

- Giữ nguyên hierarchy của trang: route, thứ tự section, vùng header/navigation/main/footer, nhóm component, vị trí và quan hệ giữa các phần.
- Giữ nguyên UI đã quan sát được: layout, kích thước tương đối, typography, màu, border, radius, shadow, spacing, icon, ảnh, trạng thái và chuyển động. Không tự ý đổi theme, design system, component library hoặc phong cách.
- Không redesign, “cải thiện”, tối giản, hiện đại hóa, thêm section, thêm CTA, đổi copy, đổi asset hoặc đổi hành vi nếu nguồn tham chiếu và yêu cầu không nói rõ.
- Không dùng placeholder, ảnh giả, text giả hoặc component generic để che phần chưa hiểu. Nếu thiếu asset hoặc không quan sát được hành vi, ghi rõ giới hạn và giữ cấu trúc tối thiểu cần thiết.
- Bảo toàn URL, tên route, link, query, form action và contract dữ liệu hiện có khi chúng thuộc phạm vi clone. Không đổi backend/API chỉ để thuận tiện cho frontend.
- Responsive phải suy ra từ các viewport hoặc breakpoint có bằng chứng. Không tự thêm breakpoint làm thay đổi UI ngoài nguồn.
- Không tự áp dụng các skill thiết kế như `design-taste-frontend`, `minimalist-ui`, `gpt-taste` hoặc `redesign-existing-projects`; chúng có thể làm lệch nguồn clone.

## Quy trình

Trước khi code từ URL, phải kiểm tra khả năng truy cập, status/redirect, HTML/DOM, computed style, font, asset, viewport/responsive và interaction; ghi rõ phần hoạt động, bị chặn hoặc chưa kiểm chứng.

1. **Xác định nguồn chuẩn**: phân loại URL, screenshot, recording, HTML, Figma hoặc nhiều nguồn; ghi rõ nguồn nào ưu tiên khi có mâu thuẫn. Nếu không truy cập/đọc được nguồn, dừng phần suy đoán và báo blocker cụ thể.
2. **Lập inventory trước khi sửa**: route và URL, cây section/component, header/footer, nội dung, asset, font, màu/token, kích thước/spacing, breakpoint, trạng thái và tương tác. Tách phần đã quan sát khỏi phần chỉ là giả định.
3. **Khảo sát codebase**: đọc hướng dẫn project, stack, route, component, asset và contract liên quan; tái sử dụng cơ chế render, token và component hiện có khi chúng khớp nguồn. Chỉ thay đổi file/page nằm trong phạm vi clone.
4. **Triển khai theo cấu trúc nguồn**: dựng skeleton và thứ tự section trước, sau đó khớp visual detail, nội dung, asset và tương tác. Giữ semantic HTML, accessibility và an toàn render theo rule frontend nhưng không dùng các cải thiện đó làm lý do đổi UI quan sát được.
5. **Đối chiếu fidelity**: kiểm tra cùng viewport và trạng thái với nguồn; so sánh macro-layout trước rồi tới typography, spacing, asset, màu và interaction. Nếu có sai khác không thể xác minh, ghi lại thay vì tự chọn một thiết kế mới.
6. **Bàn giao**: tự rà diff để xác nhận không có redesign hoặc thay đổi ngoài phạm vi; nêu nguồn đã dùng, phần khớp, phần chưa thể kiểm chứng và check đã chạy. Không tuyên bố pixel-perfect khi chưa có đối chiếu tương ứng.

## Quy tắc khi nguồn là screenshot hoặc ảnh

- Đọc ảnh như đặc tả thị giác: xác định bounding region, alignment, khoảng cách, tỷ lệ, thứ bậc chữ và trạng thái đang hiển thị trước khi code.
- Chỉ tái tạo những gì có bằng chứng. Không suy ra menu, animation, hover state, API data hoặc mobile layout nếu ảnh không thể hiện và người dùng chưa yêu cầu.
- Nếu chữ hoặc asset không đọc được, hỏi hoặc dùng nội dung đã có trong project; không bịa copy có ý nghĩa nghiệp vụ.
- Dùng asset local hoặc asset được người dùng cung cấp nếu có. Không tải hoặc nhúng asset bên ngoài khi chưa được cho phép.

## Tải asset vào bản clone

Trước khi tải asset, tạo inventory nguồn bằng script [`scripts/inspect-source.mjs`](scripts/inspect-source.mjs):

```bash
node .agents/skills/clone-website/scripts/inspect-source.mjs \
  https://example.com/page \
  --output clone-source.json
```

Khi nguồn là URL và người dùng yêu cầu clone, subagent phải tự chạy bước inventory này rồi tự chạy `download-assets.mjs` để đưa tài nguyên vào thư mục clone; không chờ người dùng nhắc lại. Mặc định tải tài nguyên cùng origin, không dùng `--allow-external` nếu chưa được cho phép rõ ràng.

Sau khi có HTML clone, kiểm tra inventory cấu trúc bằng [`scripts/compare-html.mjs`](scripts/compare-html.mjs). Kết quả này chỉ là kiểm tra cấu trúc; pixel fidelity vẫn phải đối chiếu cùng viewport bằng screenshot/tool phù hợp:

```bash
node .agents/skills/clone-website/scripts/compare-html.mjs \
  source.html \
  cloned.html
```

Khi nguồn URL nằm trong phạm vi clone, dùng script [`scripts/download-assets.mjs`](scripts/download-assets.mjs) để tải ảnh, video trực tiếp, poster, source, `srcset` và URL trong inline style về thư mục local. Script tạo `manifest.json` để truy vết URL nguồn → file local.

Với URL nguồn đã được người dùng giao để clone, quyền tải tài nguyên cùng origin được hiểu là đã nằm trong phạm vi công việc. Chỉ dừng và báo blocker khi nguồn yêu cầu vượt authentication/CAPTCHA/paywall, bị chặn, hoặc cần tải host ngoài/stream mà chưa được cho phép.

```bash
node .agents/skills/clone-website/scripts/download-assets.mjs \
  https://example.com/page \
  --output public/clone-assets \
  --rewrite-html public/cloned-page.html
```

- Mặc định chỉ tải asset cùng origin với page; chỉ dùng `--allow-external` khi người dùng cho phép host ngoài.
- Giới hạn mặc định là 4 download song song, 50 MiB mỗi file; điều chỉnh bằng `--concurrency` và `--max-bytes` khi có lý do rõ ràng.
- Không ghi đè source HTML; `--rewrite-html` phải trỏ tới file output riêng. Không tự tải stream `.m3u8`; manifest được ghi vào `manifest.json` để xử lý riêng bằng công cụ người dùng cho phép.
- Không tải asset chỉ vì nhìn thấy URL trong code nếu người dùng chưa cho phép; tôn trọng quyền truy cập, license, robots/ToS và giới hạn của nguồn.

## Tiêu chí nghiệm thu

- Cây trang, thứ tự section, route và hành vi trong phạm vi khớp nguồn tham chiếu.
- UI không bị tự ý đổi màu, font, spacing, component, copy, asset, breakpoint hoặc interaction.
- Không có placeholder/giả định chưa được đánh dấu trong phần đã cam kết clone.
- Kiểm tra đúng viewport, responsive state và interaction đã có bằng chứng; ghi rõ các trạng thái chưa kiểm tra.
- Diff không chứa thay đổi ngoài page/component/asset/config cần cho clone.

## Skill liên quan

- Dùng `coding-frontend` để triển khai frontend theo stack và rule thật của project.
- Dùng `image-to-code` chỉ khi người dùng yêu cầu quy trình image-first; khi đó ảnh tham chiếu vẫn là source of truth và không được tự art-direct lại.
- Dùng `workflow-test` hoặc `testcase` khi người dùng yêu cầu thiết kế/chạy test; không tự biến việc clone thành redesign.
