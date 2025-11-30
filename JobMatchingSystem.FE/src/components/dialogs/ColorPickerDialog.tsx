"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerOutput,
} from "@/components/ui/color-picker";
import Color from "color";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface ColorPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  defaultColor?: string;
  onColorChange?: (color: string) => void;
  onSave?: (color: string) => void;
  showAlpha?: boolean;
  showEyeDropper?: boolean;
}

export function ColorPickerDialog({
  open,
  onOpenChange,
  title = "Chọn Màu",
  description = "Chọn màu sắc cho CV template của bạn",
  defaultColor = "#3B82F6",
  onColorChange,
  onSave,
  showAlpha = true,
  showEyeDropper = true,
}: ColorPickerDialogProps) {
  const [selectedColor, setSelectedColor] = useState(() => Color(defaultColor));
  const [isSaving, setIsSaving] = useState(false);
  const isInitialMount = useRef(true);

  // Reset color when dialog opens
  useEffect(() => {
    if (open) {
      try {
        setSelectedColor(Color(defaultColor));
      } catch {
        setSelectedColor(Color("#3B82F6"));
      }
      isInitialMount.current = true;
    }
  }, [open, defaultColor]);

  // Memoize onChange callback để tránh vòng lặp vô hạn
  const handleColorPickerChange = useCallback((rgba: any) => {
    try {
      const color = Color.rgb(rgba[0], rgba[1], rgba[2]).alpha(rgba[3] || 1);
      setSelectedColor(color);
      // Chỉ cập nhật màu local, không gọi onColorChange ở đây
    } catch (error) {
      console.error("Error updating color:", error);
    }
  }, []);


  const handleSave = async () => {
    try {
      setIsSaving(true);
      const hexColor = selectedColor.hex();
      
      if (onSave) {
        await onSave(hexColor);
        toast.success("Đã lưu màu thành công!");
        // Gọi onColorChange sau khi save thành công
        if (onColorChange) {
          onColorChange(hexColor);
        }
        onOpenChange(false);
      } else if (onColorChange) {
        onColorChange(hexColor);
        toast.success("Đã cập nhật màu!");
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu màu");
      console.error("Error saving color:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <ColorPicker
            defaultValue={selectedColor.hex()}
            onChange={handleColorPickerChange}
          >
            <div className="flex gap-3">
              <ColorPickerSelection className="h-48 w-full rounded-lg" />
              <div className="flex flex-col gap-2">
                {showEyeDropper && <ColorPickerEyeDropper />}
                <Card className="border-2">
                  <CardContent className="p-0">
                    <div
                      className="h-16 w-16 rounded"
                      style={{ backgroundColor: selectedColor.hex() }}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Sắc độ (Hue)</Label>
              <ColorPickerHue />
            </div>
            
            {showAlpha && (
              <div className="space-y-2">
                <Label>Độ trong suốt (Alpha)</Label>
                <ColorPickerAlpha />
              </div>
            )}
            
            <div className="flex gap-2">
              <ColorPickerFormat />
              <ColorPickerOutput />
            </div>
          </ColorPicker>

          <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
            <Label className="text-sm font-semibold">Màu đã chọn:</Label>
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-lg border-2 shadow-sm"
                style={{ backgroundColor: selectedColor.hex() }}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">HEX:</span>
                  <code className="rounded bg-background px-2 py-1 text-xs font-mono">
                    {selectedColor.hex()}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">RGB:</span>
                  <code className="rounded bg-background px-2 py-1 text-xs font-mono">
                    {selectedColor.rgb().array().map((v: number) => Math.round(v)).join(", ")}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

