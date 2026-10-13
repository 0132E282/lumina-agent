---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 🛡️ Type — An toàn + Tái sử dụng + Gom theo domain"
---

# 🛡️ Type — An toàn + Tái sử dụng + Gom theo domain

**Nhóm quy tắc kết hợp**: Strict Typing + Type Reuse + Domain Organization

## Cách áp dụng

- **Tuyệt đối không dùng `any`** trong code hoặc test: không `as any`, `any[]`, `Record<string, any>` hay implicit `any`. Dữ liệu chưa biết kiểu dùng `unknown`, rồi validate/narrow trước khi sử dụng. Không dùng `as unknown as T`, `@ts-ignore` hoặc tắt lint để lách kiểm tra kiểu.
- **Tìm type có sẵn trước khi tạo mới**: tái sử dụng type của domain, SDK hoặc schema hiện có. Ưu tiên type inference khi đã đủ rõ; không tạo alias/interface trùng cấu trúc chỉ để đổi tên.
- **Mở rộng từ type gốc**: dùng `extends`, intersection hoặc `Pick`/`Omit`/`Partial` khi đúng ngữ nghĩa, thay vì chép lại field. Chỉ tạo type mới khi biểu diễn khái niệm hoặc hợp đồng khác thật sự; không ép kế thừa giữa hai domain không liên quan.
- **Gom type liên quan trong cùng file theo domain ở `types/`** (hoặc thư mục types của module hiện có). Ví dụ `types/products.ts` chứa `Product`, `ProductCategory`, `CreateProductInput`, `UpdateProductInput`; không tách thành `product.ts`, `product-category.ts`, `create-product-input.ts` chỉ vì khác tên type. Domain khác như orders dùng `types/orders.ts`; không gom mọi domain vào một file chung.
- Import type từ nguồn duy nhất bằng `import type` khi phù hợp. Không khai báo lại domain type trong component, service hoặc hook. Không sao chép type generated vào `types/`; import từ nguồn generated và chỉ dẫn xuất khi cần.
- Khi sửa TypeScript, chạy type checker và lint có sẵn; xử lý lỗi kiểu ở nguồn, không dùng assertion để che dữ liệu chưa được kiểm chứng.

```typescript
// types/products.ts
export interface Product {
  id: string;
  name: string;
  categoryId: string;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export type CreateProductInput = Omit<Product, "id">;
export type UpdateProductInput = Partial<CreateProductInput>;
```
