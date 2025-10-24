import { DataTableDemo } from "@/components/ui/admin/data-table";
import { SectionCards } from "@/components/ui/admin/section-cards";

// Đảm bảo bạn có file data.json này, hoặc import từ nơi khác

export default function DashboardPage() {
  console.log("--- [Debug] DashboardPage is RENDERING ---"); // <-- THÊM DÒNG NÀY
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
        </div>
        <DataTableDemo />
      </div>
    </div>
  );
}
