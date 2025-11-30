# Hướng Dẫn Sử Dụng Color Picker Component

## ✅ Đã Cài Đặt Thành Công!

Color Picker component đã được cài đặt và sẵn sàng sử dụng trong dự án của bạn.

---

## 📍 Vị Trí Component

- **File chính**: `src/components/ui/shadcn-io/color-picker/index.tsx`
- **Wrapper**: `src/components/ui/color-picker.tsx` (để import dễ dàng hơn)

---

## 🚀 Cách Import

### Cách 1: Import từ wrapper (Khuyến nghị)

```tsx
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
} from '@/components/ui/color-picker';
```

### Cách 2: Import trực tiếp

```tsx
import { ColorPicker } from '@/components/ui/shadcn-io/color-picker';
```

---

## 💻 Ví Dụ Sử Dụng

### Ví Dụ Cơ Bản

```tsx
import { useState } from 'react';
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
} from '@/components/ui/color-picker';
import Color from 'color';

function BasicColorPicker() {
  const [selectedColor, setSelectedColor] = useState(Color('#3B82F6'));

  return (
    <div className="w-full max-w-sm space-y-4">
      <ColorPicker
        value={selectedColor.hex()}
        onChange={(rgba) => {
          const color = Color.rgb(rgba[0], rgba[1], rgba[2]).alpha(rgba[3]);
          setSelectedColor(color);
        }}
      >
        <div className="flex gap-2">
          <ColorPickerSelection className="h-44 w-full" />
          <div className="flex flex-col gap-2">
            <ColorPickerEyeDropper />
            <div
              className="size-12 rounded border"
              style={{ backgroundColor: selectedColor.hex() }}
            />
          </div>
        </div>
        <ColorPickerHue />
        <ColorPickerAlpha />
        <div className="flex gap-2">
          <ColorPickerFormat />
          <ColorPickerOutput />
        </div>
      </ColorPicker>
    </div>
  );
}
```

### Ví Dụ Với Uncontrolled Mode

```tsx
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerFormat,
  ColorPickerOutput,
} from '@/components/ui/color-picker';

function UncontrolledColorPicker() {
  return (
    <ColorPicker defaultValue="#FF5733">
      <ColorPickerSelection className="h-44 w-full" />
      <ColorPickerHue />
      <ColorPickerAlpha />
      <ColorPickerFormat />
      <ColorPickerOutput />
    </ColorPicker>
  );
}
```

### Ví Dụ Trong Form (React Hook Form)

```tsx
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerFormat,
  ColorPickerOutput,
} from '@/components/ui/color-picker';
import Color from 'color';

function ColorForm() {
  const form = useForm({
    defaultValues: {
      primaryColor: Color('#3B82F6'),
      secondaryColor: Color('#10B981'),
    },
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="primaryColor"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Màu Chính</FormLabel>
            <FormControl>
              <ColorPicker
                value={field.value?.hex()}
                onChange={(rgba) => {
                  const color = Color.rgb(rgba[0], rgba[1], rgba[2]).alpha(rgba[3]);
                  field.onChange(color);
                }}
                className="w-full"
              >
                <ColorPickerSelection className="h-44 w-full" />
                <ColorPickerHue />
                <ColorPickerAlpha />
                <div className="flex gap-2">
                  <ColorPickerFormat />
                  <ColorPickerOutput />
                </div>
              </ColorPicker>
            </FormControl>
          </FormItem>
        )}
      />
    </Form>
  );
}
```

### Ví Dụ Hoàn Chỉnh Với Card

```tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerOutput,
} from '@/components/ui/color-picker';
import Color from 'color';

export function ColorPickerDemo() {
  const [primaryColor, setPrimaryColor] = useState(Color('#3B82F6'));
  const [secondaryColor, setSecondaryColor] = useState(Color('#10B981'));

  const handleSave = () => {
    console.log('Primary:', primaryColor.hex());
    console.log('Secondary:', secondaryColor.hex());
    // Lưu màu vào state management hoặc API
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Tùy Chỉnh Màu Sắc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Màu Chính</label>
          <ColorPicker
            value={primaryColor.hex()}
            onChange={(rgba) => {
              const color = Color.rgb(rgba[0], rgba[1], rgba[2]).alpha(rgba[3]);
              setPrimaryColor(color);
            }}
          >
            <div className="flex gap-2">
              <ColorPickerSelection className="h-44 w-full" />
              <div className="flex flex-col gap-2">
                <ColorPickerEyeDropper />
                <div
                  className="size-12 rounded border"
                  style={{ backgroundColor: primaryColor.hex() }}
                />
              </div>
            </div>
            <ColorPickerHue />
            <ColorPickerAlpha />
            <div className="flex gap-2">
              <ColorPickerFormat />
              <ColorPickerOutput />
            </div>
          </ColorPicker>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">HEX:</span>
            <code className="text-sm">{primaryColor.hex()}</code>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Màu Phụ</label>
          <ColorPicker
            value={secondaryColor.hex()}
            onChange={(rgba) => {
              const color = Color.rgb(rgba[0], rgba[1], rgba[2]).alpha(rgba[3]);
              setSecondaryColor(color);
            }}
          >
            <div className="flex gap-2">
              <ColorPickerSelection className="h-44 w-full" />
              <div className="flex flex-col gap-2">
                <ColorPickerEyeDropper />
                <div
                  className="size-12 rounded border"
                  style={{ backgroundColor: secondaryColor.hex() }}
                />
              </div>
            </div>
            <ColorPickerHue />
            <ColorPickerAlpha />
            <div className="flex gap-2">
              <ColorPickerFormat />
              <ColorPickerOutput />
            </div>
          </ColorPicker>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">HEX:</span>
            <code className="text-sm">{secondaryColor.hex()}</code>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">
          Lưu Màu Sắc
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

## 📚 API Reference

### ColorPicker Props

| Prop | Type | Default | Mô Tả |
|------|------|---------|-------|
| `value` | `string \| Color` | - | Giá trị màu hiện tại (controlled) |
| `defaultValue` | `string \| Color` | `'#000000'` | Giá trị màu mặc định (uncontrolled) |
| `onChange` | `(rgba: [number, number, number, number]) => void` | - | Callback khi màu thay đổi |
| `className` | `string` | - | CSS classes tùy chỉnh |

### Components Con

1. **ColorPickerSelection** - Bảng chọn màu tương tác
2. **ColorPickerHue** - Thanh trượt điều chỉnh sắc độ
3. **ColorPickerAlpha** - Thanh trượt điều chỉnh độ trong suốt
4. **ColorPickerEyeDropper** - Công cụ lấy mẫu màu từ màn hình
5. **ColorPickerFormat** - Hiển thị giá trị màu theo định dạng
6. **ColorPickerOutput** - Dropdown chọn định dạng (HEX, RGB, HSL, CSS)

---

## ⚠️ Lưu Ý

1. **EyeDropper API**: Chỉ hoạt động trên HTTPS trong production
2. **Browser Support**: Cần trình duyệt hiện đại hỗ trợ EyeDropper API
3. **Color Library**: Component sử dụng thư viện `color` để xử lý màu

---

## 🔗 Tài Nguyên

- Component location: `src/components/ui/color-picker.tsx`
- Full component: `src/components/ui/shadcn-io/color-picker/index.tsx`
- Documentation: `SHADCN_COLOR_PICKER_INFO.md`

---

*Component đã sẵn sàng để sử dụng!* 🎨

