"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface SwitchWithConfirmProps extends Omit<React.ComponentProps<typeof Switch>, 'checked' | 'onCheckedChange'> {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  confirmTitle?: string
  confirmMessage?: string
  confirmButtonText?: string
  cancelButtonText?: string
}

/**
 * Component Switch với popover xác nhận trước khi thay đổi trạng thái
 * Tuân thủ Single Responsibility Principle: chỉ chịu trách nhiệm quản lý Switch với confirm
 */
export function SwitchWithConfirm({
  checked,
  onCheckedChange,
  confirmTitle = "Xác nhận thay đổi",
  confirmMessage,
  confirmButtonText = "Xác nhận",
  cancelButtonText = "Hủy",
  disabled = false,
  ...switchProps
}: SwitchWithConfirmProps) {
  const [open, setOpen] = React.useState(false)
  const [pendingChecked, setPendingChecked] = React.useState<boolean | null>(null)

  const handleSwitchChange = (newChecked: boolean) => {
    // Nếu đang disabled, không làm gì
    if (disabled) return

    // Nếu giá trị không thay đổi, không cần confirm
    if (newChecked === checked) return

    // Lưu giá trị mới và mở popover
    setPendingChecked(newChecked)
    setOpen(true)
  }

  const handleConfirm = () => {
    if (pendingChecked !== null) {
      onCheckedChange(pendingChecked)
      setPendingChecked(null)
    }
    setOpen(false)
  }

  const handleCancel = () => {
    setPendingChecked(null)
    setOpen(false)
  }

  // Tạo message mặc định dựa trên trạng thái
  const defaultMessage = React.useMemo(() => {
    if (pendingChecked === null) return ""
    if (pendingChecked) {
      return "Bạn có chắc chắn muốn kích hoạt?"
    }
    return "Bạn có chắc chắn muốn vô hiệu hóa?"
  }, [pendingChecked])

  const displayMessage = confirmMessage || defaultMessage

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="inline-block">
          <Switch
            {...switchProps}
            checked={checked}
            onCheckedChange={handleSwitchChange}
            disabled={disabled}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{confirmTitle}</h4>
            <p className="text-sm text-muted-foreground">{displayMessage}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="h-8"
            >
              {cancelButtonText}
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              className="h-8"
            >
              {confirmButtonText}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

