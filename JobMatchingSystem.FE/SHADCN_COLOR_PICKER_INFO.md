# Thông Tin Về Color Picker Component - Shadcn/UI

## 📋 Tổng Quan

**Color Picker** là một component từ shadcn/ui cho phép người dùng chọn màu sắc một cách trực quan và tương tác trong ứng dụng React. Component này hiện **CHƯA** được cài đặt trong dự án của bạn.

---

## ✨ Tính Năng Chính

### 1. **Lựa Chọn Màu Tương Tác**
- Cho phép chọn màu bằng cách kéo trên bảng màu
- Thanh trượt điều chỉnh **Hue** (sắc độ)
- Thanh trượt điều chỉnh **Alpha** (độ trong suốt)
- Giao diện trực quan, dễ sử dụng

### 2. **Công Cụ EyeDropper** 🎨
- Lấy mẫu màu trực tiếp từ màn hình
- Sử dụng EyeDropper API của trình duyệt
- **Lưu ý**: Yêu cầu kết nối HTTPS trong môi trường production

### 3. **Hỗ Trợ Nhiều Định Dạng**
Component hỗ trợ xuất/nhập màu với các định dạng:
- **HEX** (ví dụ: `#FF5733`)
- **RGB** (ví dụ: `rgb(255, 87, 51)`)
- **HSL** (ví dụ: `hsl(9, 100%, 60%)`)
- **CSS** color names

### 4. **Xem Trước Theo Thời Gian Thực**
- Cập nhật màu sắc ngay lập tức
- Hiệu ứng mượt mà
- Styled với Tailwind CSS

### 5. **Thiết Kế Truy Cập (Accessibility)**
- Hỗ trợ điều hướng bằng bàn phím
- Tương thích với trình đọc màn hình
- Tuân theo các mẫu thiết kế của shadcn/ui

### 6. **TypeScript Support**
- Type-safe với TypeScript
- Có type definitions đầy đủ
- Hỗ trợ cả chế độ **controlled** và **uncontrolled**

---

## 🔧 Dependencies

Component này yêu cầu các dependencies sau:

### Đã Có Trong Dự Án:
- ✅ `react` - React framework
- ✅ `react-dom` - React DOM
- ✅ `tailwindcss` - Styling
- ✅ `lucide-react` - Icons
- ✅ `class-variance-authority` - Variant styling
- ✅ `clsx` / `tailwind-merge` - Class utilities

### Cần Cài Đặt:
- ❌ `color` - Thư viện để chuyển đổi định dạng màu
  ```bash
  npm install color
  ```
- ❌ `@types/color` - Type definitions (nếu sử dụng TypeScript)
  ```bash
  npm install --save-dev @types/color
  ```

---

## 📦 Cài Đặt

### Cách 1: Sử dụng URL trực tiếp (Khuyến nghị)

```bash
npx shadcn@latest add https://www.shadcn.io/registry/color-picker.json
```

### Cách 2: Cài đặt thủ công

1. **Cài đặt thư viện color:**
```bash
npm install color
npm install --save-dev @types/color
```

2. **Thêm component từ registry:**
```bash
npx shadcn@latest add color-picker
```

### Sau khi cài đặt:
Component sẽ được tạo tại: `src/components/ui/color-picker.tsx`

---

## 💻 Cách Sử Dụng

### Ví Dụ Cơ Bản (Uncontrolled):

```tsx
import { ColorPicker } from "@/components/ui/color-picker"

function MyComponent() {
  return (
    <ColorPicker
      defaultValue="#FF5733"
      onChange={(color) => {
        console.log(color.hex()) // #FF5733
        console.log(color.rgb()) // { r: 255, g: 87, b: 51 }
        console.log(color.hsl()) // { h: 9, s: 100, l: 60 }
      }}
    />
  )
}
```

### Ví Dụ Controlled:

```tsx
import { useState } from "react"
import { ColorPicker } from "@/components/ui/color-picker"
import Color from "color"

function MyComponent() {
  const [selectedColor, setSelectedColor] = useState(Color("#FF5733"))

  return (
    <ColorPicker
      value={selectedColor}
      onChange={(color) => setSelectedColor(color)}
    />
  )
}
```

### Sử Dụng Với Form (React Hook Form):

```tsx
import { useForm } from "react-hook-form"
import { ColorPicker } from "@/components/ui/color-picker"
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form"

function ColorForm() {
  const form = useForm({
    defaultValues: {
      primaryColor: Color("#FF5733")
    }
  })

  return (
    <FormField
      control={form.control}
      name="primaryColor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Màu Chủ Đạo</FormLabel>
          <FormControl>
            <ColorPicker
              value={field.value}
              onChange={field.onChange}
            />
          </FormControl>
        </FormItem>
      )}
    />
  )
}
```

### Sử Dụng EyeDropper:

```tsx
import { ColorPicker } from "@/components/ui/color-picker"

function MyComponent() {
  return (
    <ColorPicker
      defaultValue="#FF5733"
      showEyeDropper={true} // Bật công cụ EyeDropper
      onChange={(color) => console.log(color.hex())}
    />
  )
}
```

---

## 🎯 Trường Hợp Sử Dụng

### 1. **Công Cụ Thiết Kế**
- Chọn màu cho chủ đề (theme colors)
- Tùy chỉnh thương hiệu
- Thiết lập màu sắc cho UI components

### 2. **Tạo Nội Dung**
- Thiết lập màu văn bản
- Chọn màu nền
- Tùy chỉnh màu cho các elements

### 3. **Thương Mại Điện Tử**
- Tùy chỉnh sản phẩm
- Lựa chọn biến thể màu sắc
- Color swatches cho sản phẩm

### 4. **Bảng Điều Khiển Quản Trị**
- Cấu hình thương hiệu
- Thiết lập chủ đề
- Quản lý màu sắc hệ thống

### 5. **Ứng Dụng Cho Dự Án Job Matching**
- Cho phép công ty tùy chỉnh màu thương hiệu
- Người dùng chọn màu yêu thích
- Thiết lập chủ đề màu cho dashboard

---

## 📚 API Reference

### Props

| Prop | Type | Default | Mô Tả |
|------|------|---------|-------|
| `value` | `Color` | - | Giá trị màu hiện tại (controlled mode) |
| `defaultValue` | `Color \| string` | - | Giá trị màu mặc định (uncontrolled mode) |
| `onChange` | `(color: Color) => void` | - | Callback khi màu thay đổi |
| `showEyeDropper` | `boolean` | `true` | Hiển thị nút EyeDropper |
| `formats` | `Array<'hex' \| 'rgb' \| 'hsl'>` | `['hex', 'rgb', 'hsl']` | Định dạng màu hiển thị |
| `disabled` | `boolean` | `false` | Vô hiệu hóa component |
| `className` | `string` | - | Custom CSS classes |

### Methods

Component trả về object `Color` từ thư viện `color`, có các methods:

- `color.hex()` - Trả về giá trị HEX
- `color.rgb()` - Trả về object RGB
- `color.hsl()` - Trả về object HSL
- `color.alpha()` - Lấy/set độ trong suốt
- `color.darken(0.1)` - Làm tối màu
- `color.lighten(0.1)` - Làm sáng màu

---

## ⚠️ Lưu Ý Quan Trọng

1. **HTTPS Requirement**: 
   - EyeDropper API chỉ hoạt động trên HTTPS
   - Cần cấu hình HTTPS cho production

2. **Browser Support**:
   - EyeDropper API được hỗ trợ trên các trình duyệt hiện đại
   - Chrome/Edge: ✅ Full support
   - Firefox: ⚠️ Limited support
   - Safari: ⚠️ Limited support

3. **Performance**:
   - Component sử dụng CSS variables cho hiệu suất tốt
   - Có thể tối ưu với `useMemo` cho các tính toán màu phức tạp

---

## 🔗 Tài Nguyên

### Tài Liệu Chính Thức:
- **Trang Component**: https://www.shadcn.io/components/forms/color-picker
- **Registry**: https://www.shadcn.io/registry/color-picker
- **Demo**: https://shadcn-color-picker.kurtsanjose.dev

### Thư Viện Hỗ Trợ:
- **Color Library**: https://github.com/Qix-/color
- **Color Docs**: https://github.com/Qix-/color#readme

### Biến Thể Khác:
- Achromatic Color Picker
- Jolly UI's Color Picker
- Kibo UI Color Picker

---

## 📝 Ví Dụ Hoàn Chỉnh

```tsx
import { useState } from "react"
import { ColorPicker } from "@/components/ui/color-picker"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Color from "color"

export function ColorPickerExample() {
  const [primaryColor, setPrimaryColor] = useState(Color("#3B82F6"))
  const [secondaryColor, setSecondaryColor] = useState(Color("#10B981"))

  const handleApply = () => {
    // Lưu màu vào database hoặc state management
    console.log("Primary:", primaryColor.hex())
    console.log("Secondary:", secondaryColor.hex())
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Tùy Chỉnh Màu Sắc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Màu Chính</label>
          <ColorPicker
            value={primaryColor}
            onChange={setPrimaryColor}
            showEyeDropper={true}
          />
          <div className="flex items-center gap-2">
            <div
              className="w-12 h-12 rounded border"
              style={{ backgroundColor: primaryColor.hex() }}
            />
            <span className="text-sm text-muted-foreground">
              {primaryColor.hex()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Màu Phụ</label>
          <ColorPicker
            value={secondaryColor}
            onChange={setSecondaryColor}
            showEyeDropper={true}
          />
          <div className="flex items-center gap-2">
            <div
              className="w-12 h-12 rounded border"
              style={{ backgroundColor: secondaryColor.hex() }}
            />
            <span className="text-sm text-muted-foreground">
              {secondaryColor.hex()}
            </span>
          </div>
        </div>

        <Button onClick={handleApply} className="w-full">
          Áp Dụng Màu
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## ✅ Checklist Cài Đặt

- [ ] Cài đặt thư viện `color`: `npm install color`
- [ ] Cài đặt types: `npm install --save-dev @types/color`
- [ ] Thêm component: `npx shadcn@latest add https://www.shadcn.io/registry/color-picker.json`
- [ ] Kiểm tra component đã được tạo tại `src/components/ui/color-picker.tsx`
- [ ] Test component trong development
- [ ] Cấu hình HTTPS cho production (nếu sử dụng EyeDropper)

---

*Cập nhật: Tháng 12, 2024*
