# Color Picker Implementation - Hướng Dẫn Triển Khai

## ✅ Đã Hoàn Thành

Color Picker component từ shadcn/ui đã được triển khai thành công vào ứng dụng Job Matching System.

---

## 📁 Cấu Trúc Files

### 1. Core Component
- **`src/components/ui/shadcn-io/color-picker/index.tsx`**
  - Component chính từ shadcn registry
  - Đã được sửa import từ `radix-ui` sang `@radix-ui/react-slider`
  - Đã được tối ưu logic cho controlled/uncontrolled mode

### 2. Wrapper Component
- **`src/components/ui/color-picker.tsx`**
  - File re-export để import dễ dàng hơn
  - Export tất cả components và types

### 3. Dialog Component
- **`src/components/dialogs/ColorPickerDialog.tsx`**
  - Dialog component hoàn chỉnh để chọn màu
  - Có preview, format selection, và eye dropper
  - Hỗ trợ save và onChange callbacks

### 4. CV Color Picker Component
- **`src/components/ui/candidate/CVColorPicker.tsx`**
  - Component đặc biệt cho CV template color selection
  - Có preview card với màu hiện tại
  - Tích hợp sẵn với ColorPickerDialog

### 5. Demo Page
- **`src/pages/client-site/candidate/ColorPickerDemo.tsx`**
  - Trang demo đầy đủ tính năng
  - Hiển thị các ví dụ sử dụng
  - Có preview section và usage instructions

---

## 🚀 Cách Sử Dụng

### Cách 1: Sử dụng CVColorPicker Component (Khuyến nghị)

```tsx
import { CVColorPicker } from "@/components/ui/candidate/CVColorPicker";

function MyComponent() {
  const handleSaveColor = async (color: string) => {
    // Lưu màu vào API
    await saveColorToAPI(color);
  };

  return (
    <CVColorPicker
      label="Màu CV Template"
      defaultValue="#3B82F6"
      onColorChange={(color) => console.log("Color changed:", color)}
      onSave={handleSaveColor}
    />
  );
}
```

### Cách 2: Sử dụng ColorPickerDialog trực tiếp

```tsx
import { useState } from "react";
import { ColorPickerDialog } from "@/components/dialogs/ColorPickerDialog";
import { Button } from "@/components/ui/button";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#3B82F6");

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Chọn Màu</Button>
      
      <ColorPickerDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Chọn Màu"
        description="Chọn màu sắc cho CV template"
        defaultColor={selectedColor}
        onSave={async (color) => {
          setSelectedColor(color);
          // Lưu vào API
        }}
      />
    </>
  );
}
```

### Cách 3: Sử dụng ColorPicker Component trực tiếp

```tsx
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerFormat,
  ColorPickerOutput,
} from "@/components/ui/color-picker";

function MyComponent() {
  return (
    <ColorPicker defaultValue="#3B82F6">
      <ColorPickerSelection className="h-48 w-full" />
      <ColorPickerHue />
      <ColorPickerAlpha />
      <ColorPickerFormat />
      <ColorPickerOutput />
    </ColorPicker>
  );
}
```

---

## 📍 Routes

### Demo Page
- **URL**: `/color-picker-demo`
- **Component**: `ColorPickerDemo`
- **Mô tả**: Trang demo đầy đủ tính năng của Color Picker

Đã được thêm vào `src/app-router.tsx`:

```tsx
<Route path="color-picker-demo" element={<ColorPickerDemo />} />
```

---

## 🎨 Tính Năng

### ColorPickerDialog
- ✅ Chọn màu tương tác với bảng màu
- ✅ Thanh trượt điều chỉnh Hue và Alpha
- ✅ Công cụ EyeDropper (lấy màu từ màn hình)
- ✅ Hiển thị nhiều định dạng (HEX, RGB, HSL, CSS)
- ✅ Preview màu real-time
- ✅ Hỗ trợ controlled và uncontrolled mode

### CVColorPicker
- ✅ Card component với preview
- ✅ Hiển thị giá trị HEX và RGB
- ✅ Tích hợp sẵn dialog
- ✅ Callback onColorChange và onSave

---

## 🔧 Props API

### ColorPickerDialog Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `open` | `boolean` | - | Trạng thái mở/đóng dialog |
| `onOpenChange` | `(open: boolean) => void` | - | Callback khi trạng thái thay đổi |
| `title` | `string` | `"Chọn Màu"` | Tiêu đề dialog |
| `description` | `string` | `"Chọn màu sắc..."` | Mô tả dialog |
| `defaultColor` | `string` | `"#3B82F6"` | Màu mặc định |
| `onColorChange` | `(color: string) => void` | - | Callback khi màu thay đổi |
| `onSave` | `(color: string) => Promise<void>` | - | Callback khi lưu màu |
| `showAlpha` | `boolean` | `true` | Hiển thị thanh trượt alpha |
| `showEyeDropper` | `boolean` | `true` | Hiển thị nút eye dropper |

### CVColorPicker Props

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `label` | `string` | `"Màu CV Template"` | Nhãn hiển thị |
| `defaultValue` | `string` | `"#3B82F6"` | Màu mặc định |
| `onColorChange` | `(color: string) => void` | - | Callback khi màu thay đổi |
| `onSave` | `(color: string) => Promise<void>` | - | Callback khi lưu màu |

---

## 🎯 Trường Hợp Sử Dụng

### 1. Chọn màu CV Template
- Sử dụng `CVColorPicker` component
- Lưu màu vào database để áp dụng cho CV template
- Cho phép ứng viên tùy chỉnh màu sắc CV của họ

### 2. Tùy chỉnh màu thương hiệu
- Sử dụng `ColorPickerDialog` để chọn màu brand
- Áp dụng cho company profile
- Lưu vào company settings

### 3. Theme Customization
- Cho phép người dùng tùy chỉnh màu chủ đề
- Áp dụng cho dashboard và UI elements

---

## 📝 Ví Dụ Tích Hợp Vào ProfileCVPage

Để tích hợp vào ProfileCVPage, bạn có thể thêm:

```tsx
import { CVColorPicker } from "@/components/ui/candidate/CVColorPicker";

// Trong component ProfileCvPage
const [cvColor, setCvColor] = useState("#3B82F6");

const handleSaveCVColor = async (color: string) => {
  // Lưu màu vào API
  try {
    await CVServices.updateCVColor(color);
    toast.success("Đã lưu màu CV thành công!");
  } catch (error) {
    toast.error("Có lỗi xảy ra khi lưu màu");
  }
};

// Trong render, thêm vào đầu trang hoặc trong một section riêng
<CVColorPicker
  label="Màu CV Template"
  defaultValue={cvColor}
  onColorChange={setCvColor}
  onSave={handleSaveCVColor}
/>
```

---

## ⚠️ Lưu Ý

1. **EyeDropper API**: 
   - Chỉ hoạt động trên HTTPS trong production
   - Cần cấu hình HTTPS cho môi trường production

2. **Browser Support**:
   - EyeDropper được hỗ trợ trên Chrome/Edge
   - Firefox và Safari có hỗ trợ hạn chế

3. **Dependencies**:
   - Component đã cài đặt `color` library
   - Đã có `@radix-ui/react-slider` trong dependencies

---

## 🔗 Tài Liệu Liên Quan

- **Component Info**: `SHADCN_COLOR_PICKER_INFO.md`
- **Usage Guide**: `COLOR_PICKER_USAGE.md`
- **Components List**: `SHADCN_COMPONENTS_LIST.md`

---

## ✅ Checklist Implementation

- [x] Cài đặt thư viện `color`
- [x] Thêm color-picker component từ shadcn
- [x] Sửa import và logic của component
- [x] Tạo ColorPickerDialog component
- [x] Tạo CVColorPicker component
- [x] Tạo demo page
- [x] Thêm route cho demo page
- [x] Kiểm tra và sửa lỗi TypeScript
- [x] Tạo tài liệu hướng dẫn

---

*Color Picker đã sẵn sàng để sử dụng trong ứng dụng!* 🎨

