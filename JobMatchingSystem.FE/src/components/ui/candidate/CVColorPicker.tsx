"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ColorPickerDialog } from "@/components/dialogs/ColorPickerDialog";
import { Palette } from "lucide-react";
import Color from "color";

interface CVColorPickerProps {
  label?: string;
  defaultValue?: string;
  onColorChange?: (color: string) => void;
  onSave?: (color: string) => Promise<void>;
}

export function CVColorPicker({
  label = "Màu CV Template",
  defaultValue = "#3B82F6",
  onColorChange,
  onSave,
}: CVColorPickerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState<string>(defaultValue);

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    if (onColorChange) {
      onColorChange(color);
    }
  };

  const handleSave = async (color: string) => {
    setCurrentColor(color);
    if (onSave) {
      await onSave(color);
    }
    if (onColorChange) {
      onColorChange(color);
    }
  };

  let colorDisplay: string;
  try {
    colorDisplay = Color(currentColor).hex();
  } catch {
    colorDisplay = defaultValue;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {label}
          </CardTitle>
          <CardDescription>
            Chọn màu sắc cho CV template của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 rounded-lg border-2 shadow-sm transition-all hover:scale-105 cursor-pointer"
              style={{ backgroundColor: colorDisplay }}
              onClick={() => setIsDialogOpen(true)}
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">HEX:</span>
                <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                  {colorDisplay}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">RGB:</span>
                <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                  {(() => {
                    try {
                      return Color(colorDisplay)
                        .rgb()
                        .array()
                        .map((v) => Math.round(v))
                        .join(", ");
                    } catch {
                      return "255, 255, 255";
                    }
                  })()}
                </code>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            variant="outline"
            className="w-full"
          >
            <Palette className="mr-2 h-4 w-4" />
            Chọn Màu
          </Button>
        </CardContent>
      </Card>

      <ColorPickerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Chọn Màu CV Template"
        description="Chọn màu sắc chủ đạo cho CV template của bạn"
        defaultColor={currentColor}
        onColorChange={handleColorChange}
        onSave={handleSave}
        showAlpha={false}
        showEyeDropper={true}
      />
    </>
  );
}

