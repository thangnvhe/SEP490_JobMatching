"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CandidateTaxonomyService } from "@/services/candidate-taxonomy.service";
import { TaxonomyService } from "@/services/taxonomy.service";
import type { CandidateTaxonomy } from "@/models/candidate-taxonomy";
import type { Taxonomy } from "@/models/taxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import { X, Wrench, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDisableBodyScroll } from "@/hooks/useDisableBodyScroll";

// Zod schema definition
const formSchema = z.object({
  taxonomyId: z.number({ required_error: "Vui lòng chọn kỹ năng" }),
  experienceYear: z.number({ required_error: "Vui lòng nhập số năm kinh nghiệm" })
    .int("Số năm kinh nghiệm phải là số nguyên")
    .min(0, "Số năm kinh nghiệm phải >= 0")
    .max(50, "Số năm kinh nghiệm không hợp lệ"),
});

type FormData = z.infer<typeof formSchema>;

interface DialogCVTaxonomyProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  taxonomyToEdit?: CandidateTaxonomy | null;
}

export function DialogCVTaxonomy({
  open,
  onOpenChange,
  onSuccess,
  taxonomyToEdit,
}: DialogCVTaxonomyProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const [taxonomyOpen, setTaxonomyOpen] = useState(false);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [loadingTaxonomies, setLoadingTaxonomies] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taxonomyId: undefined,
      experienceYear: 0,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = form;

  const selectedTaxonomyId = watch("taxonomyId");

  // Disable body scroll when dialog is open
  useDisableBodyScroll(open);

  // Fetch taxonomies when dialog opens
  useEffect(() => {
    const fetchTaxonomies = async () => {
      try {
        setLoadingTaxonomies(true);
        const response = await TaxonomyService.getAllTaxonomies();
        setTaxonomies(response.result || []);
      } catch (error) {
        console.error("Failed to fetch taxonomies", error);
        toast.error("Không thể tải danh sách kỹ năng");
      } finally {
        setLoadingTaxonomies(false);
      }
    };

    if (open) {
      fetchTaxonomies();
    }
  }, [open]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (taxonomyToEdit) {
        reset({
          taxonomyId: taxonomyToEdit.taxonomyId,
          experienceYear: taxonomyToEdit.experienceYear || 0,
        });
      } else {
        reset({
          taxonomyId: undefined,
          experienceYear: 0,
        });
      }
    }
  }, [open, taxonomyToEdit, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setActionLoading(true);

      const submitData = {
        taxonomyId: data.taxonomyId,
        experienceYear: data.experienceYear,
      };

      if (taxonomyToEdit?.id) {
        await CandidateTaxonomyService.update(taxonomyToEdit.id, submitData);
        toast.success("Cập nhật kỹ năng thành công");
      } else {
        await CandidateTaxonomyService.create(submitData);
        toast.success("Thêm kỹ năng thành công");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(taxonomyToEdit ? "Có lỗi xảy ra khi cập nhật" : "Có lỗi xảy ra khi thêm mới");
    } finally {
      setActionLoading(false);
    }
  };

  const getSelectedTaxonomyName = () => {
    const taxonomy = taxonomies.find((t) => t.id === selectedTaxonomyId);
    return taxonomy?.name || "";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in-0">
      <div
        className="absolute inset-0"
        onClick={() => !actionLoading && onOpenChange(false)}
      />
      <div
        ref={modalContentRef}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg bg-white shadow-lg animate-in zoom-in-95 duration-200"
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {taxonomyToEdit ? "Cập nhật kỹ năng" : "Thêm kỹ năng"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {taxonomyToEdit
                  ? "Cập nhật thông tin kỹ năng của bạn"
                  : "Nhập thông tin kỹ năng bạn có"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
            disabled={actionLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body - Scrollable */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 py-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2"
        >
          <div className="grid gap-4">
            {/* Taxonomy Select field */}
            <div>
              <Label className="text-sm font-medium">
                Kỹ năng <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="taxonomyId"
                render={({ field }) => (
                  <Popover open={taxonomyOpen} onOpenChange={setTaxonomyOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={taxonomyOpen}
                        className={cn(
                          "w-full justify-between text-left font-normal mt-1",
                          !field.value && "text-muted-foreground",
                          errors.taxonomyId && "border-red-500"
                        )}
                        disabled={actionLoading || loadingTaxonomies}
                      >
                        {loadingTaxonomies ? (
                          "Đang tải..."
                        ) : field.value ? (
                          getSelectedTaxonomyName()
                        ) : (
                          "Chọn kỹ năng"
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Tìm kiếm kỹ năng..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy kỹ năng</CommandEmpty>
                          <CommandGroup>
                            {taxonomies.map((taxonomy) => (
                              <CommandItem
                                key={taxonomy.id}
                                value={taxonomy.name}
                                onSelect={() => {
                                  setValue("taxonomyId", taxonomy.id);
                                  setTaxonomyOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === taxonomy.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {taxonomy.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.taxonomyId && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.taxonomyId.message}
                </p>
              )}
            </div>

            {/* Experience Year field */}
            <div>
              <Label className="text-sm font-medium">
                Số năm kinh nghiệm <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="experienceYear"
                render={({ field }) => (
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    step={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    placeholder="Ví dụ: 2"
                    className={`w-full mt-1 ${errors.experienceYear ? "border-red-500" : ""}`}
                    disabled={actionLoading}
                  />
                )}
              />
              {errors.experienceYear && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.experienceYear.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Nhập số năm kinh nghiệm với kỹ năng này
              </p>
            </div>
          </div>
        </form>

        {/* Footer - Submit buttons */}
        <div className="flex items-center justify-end gap-2 p-6 pt-4 border-t border-gray-100 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={actionLoading}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={actionLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {actionLoading ? "Đang lưu..." : "Lưu kỹ năng"}
          </Button>
        </div>
      </div>
    </div>
  );
}

