# Danh Sách Tất Cả Components Shadcn/UI

## 📋 Tổng Quan
Dự án của bạn đã cài đặt nhiều components từ shadcn/ui. Dưới đây là danh sách đầy đủ tất cả các component có sẵn từ shadcn/ui.

---

## ✅ Components Đã Cài Đặt Trong Dự Án

Dựa trên thư mục `src/components/ui/`, bạn đã có:

1. ✅ accordion
2. ✅ alert
3. ✅ alert-dialog
4. ✅ aspect-ratio
5. ✅ avatar
6. ✅ badge
7. ✅ breadcrumb
8. ✅ button
9. ✅ button-group
10. ✅ calendar
11. ✅ card
12. ✅ carousel
13. ✅ chart
14. ✅ checkbox
15. ✅ collapsible
16. ✅ command
17. ✅ context-menu
18. ✅ data-table
19. ✅ dialog
20. ✅ drawer
21. ✅ dropdown-menu
22. ✅ empty
23. ✅ field
24. ✅ form
25. ✅ hover-card
26. ✅ input
27. ✅ input-group
28. ✅ input-otp
29. ✅ kbd
30. ✅ label
31. ✅ menubar
32. ✅ navigation-menu
33. ✅ pagination
34. ✅ popover
35. ✅ progress
36. ✅ radio-group
37. ✅ resizable
38. ✅ scroll-area
39. ✅ select
40. ✅ separator
41. ✅ sheet
42. ✅ sidebar
43. ✅ skeleton
44. ✅ slider
45. ✅ sonner
46. ✅ switch
47. ✅ table
48. ✅ tabs
49. ✅ textarea
50. ✅ toast (deprecated - nên dùng sonner)
51. ✅ toggle
52. ✅ toggle-group
53. ✅ tooltip

---

## 📦 Tất Cả Components Có Sẵn Từ Shadcn/UI

### Core Components (50+ components)

1. **accordion** - Component hiển thị nội dung có thể mở rộng/thu gọn
2. **alert** - Thông báo cảnh báo cho người dùng
3. **alert-dialog** - Hộp thoại xác nhận hành động quan trọng
4. **aspect-ratio** - Duy trì tỷ lệ khung hình
5. **avatar** - Hiển thị ảnh đại diện người dùng
6. **badge** - Nhãn nhỏ để phân loại/thông báo
7. **breadcrumb** - Điều hướng phân cấp
8. **button** - Nút bấm cơ bản
9. **button-group** - Nhóm các nút bấm
10. **calendar** - Lịch để chọn ngày
11. **card** - Thẻ container cho nội dung
12. **carousel** - Trình chiếu hình ảnh/nội dung
13. **chart** - Biểu đồ và đồ thị
14. **checkbox** - Hộp kiểm tra
15. **collapsible** - Nội dung có thể thu gọn
16. **combobox** - Kết hợp input và dropdown
17. **command** - Command palette/command menu
18. **context-menu** - Menu ngữ cảnh (click phải)
19. **data-table** - Bảng dữ liệu với sorting/filtering
20. **date-picker** - Chọn ngày tháng
21. **dialog** - Modal dialog
22. **drawer** - Drawer/menu trượt từ cạnh
23. **dropdown-menu** - Menu dropdown
24. **empty** - Trạng thái trống/rỗng
25. **field** - Field wrapper với label và error
26. **form** - Form components với validation
27. **hover-card** - Card hiện khi hover
28. **input** - Ô nhập liệu
29. **input-group** - Nhóm các input
30. **input-otp** - Input cho mã OTP
31. **kbd** - Hiển thị phím bàn phím
32. **label** - Nhãn cho form fields
33. **menubar** - Thanh menu
34. **navigation-menu** - Menu điều hướng
35. **pagination** - Phân trang
36. **popover** - Popover tooltip
37. **progress** - Thanh tiến trình
38. **radio-group** - Nhóm radio buttons
39. **resizable** - Panel có thể thay đổi kích thước
40. **scroll-area** - Vùng cuộn tùy chỉnh
41. **select** - Dropdown select
42. **separator** - Đường phân cách
43. **sheet** - Side sheet/drawer
44. **sidebar** - Sidebar navigation
45. **skeleton** - Loading skeleton
46. **slider** - Thanh trượt giá trị
47. **sonner** - Toast notification (thay thế toast)
48. **switch** - Toggle switch
49. **table** - Bảng cơ bản
50. **tabs** - Tab navigation
51. **textarea** - Ô nhập văn bản dài
52. **toast** - ⚠️ Đã deprecated, nên dùng sonner
53. **toggle** - Toggle button
54. **toggle-group** - Nhóm toggle buttons
55. **tooltip** - Tooltip hướng dẫn

---

## 🔍 Components Có Thể Bạn Chưa Cài

Dựa trên danh sách trên, các components bạn có thể chưa có:

- ❓ **combobox** - Kết hợp input và dropdown (có thể có nhưng chưa thấy)
- ❓ **date-picker** - Chọn ngày tháng (có thể nằm trong calendar)

---

## 📝 Cách Thêm Component Mới

### Thêm một component:
```bash
npx shadcn@latest add [component-name]
```

### Thêm nhiều components:
```bash
npx shadcn@latest add button card dialog
```

### Thêm tất cả components:
```bash
npx shadcn@latest add --all
```

### Ví dụ thêm các components phổ biến:
```bash
# Thêm combobox
npx shadcn@latest add combobox

# Thêm date-picker (nếu chưa có)
npx shadcn@latest add date-picker
```

---

## 🔗 Tài Nguyên

- **Trang chủ**: https://ui.shadcn.com
- **Tài liệu**: https://ui.shadcn.com/docs
- **Components**: https://ui.shadcn.com/docs/components
- **Registry**: https://ui.shadcn.com/registry

---

## 💡 Ghi Chú

1. Component **toast** đã được deprecated, nên sử dụng **sonner** thay thế
2. Component **collapsible** không có UI, chỉ là logic component
3. Một số components như **form**, **field** là wrapper components hỗ trợ validation
4. Shadcn/ui components có thể tùy chỉnh hoàn toàn vì code nằm trong project của bạn

---

*Cập nhật: Dựa trên shadcn/ui phiên bản mới nhất*
