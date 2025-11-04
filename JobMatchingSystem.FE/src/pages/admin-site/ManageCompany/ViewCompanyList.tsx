import * as React from "react";
import { SearchIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { CompanyServices } from "@/services/company.service";
import type { Company } from "@/models/company";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { API_BASE_URL } from "../../../../env";

// ------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------
export function ManageCompanyPage() {
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPendingCompanies = async () => {
      setIsLoading(true);
      try {
        setFetchError(null);
        const res = await CompanyServices.getAllPendingCompanies({});
        const rawData = (res as any)?.result ?? res ?? [];

        console.log("📦 API rawData:", rawData);

        // ✅ Chuẩn hóa dữ liệu để khớp interface Company
        const mappedData: Company[] = Array.isArray(rawData)
          ? rawData.map((item: any) => {
              // support PascalCase (CompanyName), snake_case (company_name) and camelCase (companyName)
              const idRaw =
                item.CompanyId ?? item.companyId ?? item.company_id ?? item.id ?? "";
              return {
                CompanyId: idRaw !== null && idRaw !== undefined ? String(idRaw) : "",
                CompanyName:
                  item.CompanyName ?? item.companyName ?? item.company_name ?? item.name ?? "",
                Description:
                  item.Description ?? item.description ?? item.desc ?? "",
                Logo: item.Logo ?? item.logo ?? item.imageUrl ?? "",
                Email: item.Email ?? item.email ?? "",
                Website: item.Website ?? item.website ?? item.websiteUrl ?? "",
                Address: item.Address ?? item.address ?? item.location ?? "",
                PhoneContact:
                  item.PhoneContact ?? item.phoneContact ?? item.phone_contact ?? "",
                TaxCode: item.TaxCode ?? item.taxCode ?? item.tax_code ?? "",
                LicenseFile:
                  item.LicenseFile ?? item.licenseFile ?? item.license_file ?? "",
              };
            })
          : [];

        setCompanies(mappedData);
      } catch (err: any) {
        console.error("❌ Lỗi khi tải danh sách công ty pending:", err);
        const msg =
          err?.code === "ECONNABORTED"
            ? "Kết nối tới máy chủ quá lâu, vui lòng thử lại."
            : err?.message ?? "Lỗi khi gọi API";
        setFetchError(msg);
        setCompanies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingCompanies();
  }, []);

  // ✅ Lọc theo tên công ty
  const filteredCompanies = React.useMemo(() => {
    return companies.filter((c) =>
      (c.CompanyName ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  // Dialog state for viewing company details
  const [selectedCompany, setSelectedCompany] = React.useState<Company | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const navigate = useNavigate();

  // ✅ Khi duyệt hoặc từ chối công ty, xóa khỏi danh sách
  const handleActionDone = (companyId: string) => {
    setCompanies((prev) => prev.filter((c) => c.CompanyId !== companyId));
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Duyệt Công Ty</h1>

      {/* Thanh tìm kiếm */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div className="w-full md:w-auto md:flex-1 lg:max-w-xs">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Tìm kiếm công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
      </div>

      {/* Bảng hiển thị công ty */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên công ty</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="hidden lg:table-cell">Mã số thuế</TableHead>
              <TableHead className="text-right last:pr-16">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : fetchError ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-red-600"
                >
                  {fetchError}
                </TableCell>
              </TableRow>
            ) : filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  Không có công ty nào đang chờ duyệt.
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company, idx) => (
                <TableRow key={company.CompanyId || `company-${idx}`}>
                  <TableCell className="font-medium">
                    {company.CompanyName || "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {company.Email || "-"}
                  </TableCell>
                  <TableCell>
                    <CompanyStatusBadge status="pending" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {company.TaxCode || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View button: open dialog */}
                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setIsDialogOpen(true);
                        }}
                        className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-sm"
                      >
                        View
                      </button>

                      {/* Edit button: navigate to edit page (implement route separately) */}
                      <button
                        onClick={() => navigate(`/admin/companies/edit/${company.CompanyId}`)}
                        className="px-2 py-1 rounded bg-sky-50 text-sky-700 text-sm"
                      >
                        Edit
                      </button>

                      {/* Delete button: call delete API and remove from list on success */}
                      <button
                        onClick={async () => {
                          if (!window.confirm("Bạn có chắc chắn muốn xóa công ty này?")) return;
                          try {
                            await CompanyServices.deleteCompany(company.CompanyId);
                            alert("Đã xóa công ty.");
                            handleActionDone(company.CompanyId);
                          } catch (err) {
                            console.error('Delete error:', err);
                            console.error('Response data:', (err as any)?.response?.data);
                            alert("Lỗi khi xóa công ty. Vui lòng thử lại.");
                          }
                        }}
                        className="px-2 py-1 rounded bg-red-50 text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Company Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogContent className="max-w-5xl w-full">
          <DialogHeader>
            <DialogTitle>Company details</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết công ty. Bạn có thể duyệt (Accept) hoặc từ chối
              (Reject) tại đây.
            </DialogDescription>
          </DialogHeader>

          {/* Split the dialog into 2 columns: left = details, right = license preview */}
          <div className="grid gap-3">
            {selectedCompany ? (
              (() => {
                // Helper to build public URL for the license file
                const getFullUrl = (path?: string) => {
                  if (!path) return undefined;
                  // If already an absolute URL, use it
                  if (/^https?:\/\//i.test(path)) return path;

                  // Use explicit backend base from env.ts (API_BASE_URL_V2) then fall back to current origin
                  const base = API_BASE_URL || window.location.origin || "";

                  // Ensure slashes are normalized
                  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
                  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
                  return normalizedBase ? `${normalizedBase}${normalizedPath}` : normalizedPath;
                };

                const licenseUrl = getFullUrl(selectedCompany.LicenseFile);

                const isImage = (url?: string) => !!url && /\.(png|jpe?g|gif|bmp|webp|svg)(\?.*)?$/i.test(url);
                const isPdf = (url?: string) => !!url && /\.pdf(\?.*)?$/i.test(url);

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Left column: company info */}
                    <div className="space-y-2">
                      <div>
                        <strong>Tên công ty:</strong> {selectedCompany.CompanyName}
                      </div>
                      <div>
                        <strong>Email:</strong> {selectedCompany.Email}
                      </div>
                      <div>
                        <strong>Website:</strong>{' '}
                        {selectedCompany.Website ? (
                          <a href={selectedCompany.Website} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                            {selectedCompany.Website}
                          </a>
                        ) : (
                          '-'
                        )}
                      </div>
                      <div>
                        <strong>Địa chỉ:</strong> {selectedCompany.Address}
                      </div>
                      <div>
                        <strong>Số điện thoại:</strong> {selectedCompany.PhoneContact}
                      </div>
                      <div>
                        <strong>Mã số thuế:</strong> {selectedCompany.TaxCode}
                      </div>
                      <div>
                        <strong>Mô tả:</strong>
                        <div className="whitespace-pre-wrap">{selectedCompany.Description}</div>
                      </div>
                    </div>

                    {/* Right column: license preview / link */}
                    <div className="flex items-start justify-center">
                      {licenseUrl ? (
                        <div className="w-full flex flex-col items-center">
                          {isImage(licenseUrl) ? (
                            // Image preview
                            <img
                              src={licenseUrl}
                              alt={`License for ${selectedCompany.CompanyName}`}
                              className="max-w-full max-h-[480px] object-contain border rounded shadow-sm"
                            />
                          ) : isPdf(licenseUrl) ? (
                            // PDF embed (falls back to link on browsers that block embedding)
                            <iframe
                              src={licenseUrl}
                              title="License PDF"
                              className="w-full h-[480px] border rounded"
                            />
                          ) : (
                            // Unknown file type: show link
                            <a href={licenseUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                              Xem file giấy phép
                            </a>
                          )}
                        </div>
                      ) : (
                        <div>Không có file License.</div>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div>Không có dữ liệu</div>
            )}
          </div>

          <DialogFooter>
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded bg-emerald-600 text-white ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={isProcessing}
                onClick={async () => {
                  if (!selectedCompany || isProcessing) return;
                  setIsProcessing(true);
                  try {
                    await CompanyServices.acceptCompany(selectedCompany.CompanyId);
                    alert('Đã duyệt công ty');
                    handleActionDone(selectedCompany.CompanyId);
                    setIsDialogOpen(false);
                  } catch (err) {
                    console.error('Accept error:', err);
                    console.error('Accept err.code:', (err as any)?.code);
                    console.error('Accept err.message:', (err as any)?.message);
                    console.error('Accept response.status:', (err as any)?.response?.status);
                    console.error('Accept response.data:', (err as any)?.response?.data);
                    console.error('Accept request:', (err as any)?.request);
                    try {
                      console.error('Accept err.toJSON:', JSON.stringify((err as any)?.toJSON?.()));
                    } catch {}
                    alert('Lỗi khi duyệt công ty');
                  } finally {
                    setIsProcessing(false);
                  }
                }}
              >
                {isProcessing ? 'Processing...' : 'Accept'}
              </button>

              <button
                className={`px-4 py-2 rounded bg-red-600 text-white ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={isProcessing}
                onClick={async () => {
                  if (!selectedCompany || isProcessing) return;
                  if (!window.confirm('Bạn có chắc chắn muốn từ chối công ty này?')) return;
                  setIsProcessing(true);
                  try {
                    await CompanyServices.rejectCompany(selectedCompany.CompanyId);
                    alert('Đã từ chối công ty');
                    handleActionDone(selectedCompany.CompanyId);
                    setIsDialogOpen(false);
                  } catch (err) {
                    console.error('Reject error:', err);
                    console.error('Reject err.code:', (err as any)?.code);
                    console.error('Reject err.message:', (err as any)?.message);
                    console.error('Reject response.status:', (err as any)?.response?.status);
                    console.error('Reject response.data:', (err as any)?.response?.data);
                    console.error('Reject request:', (err as any)?.request);
                    try {
                      console.error('Reject err.toJSON:', JSON.stringify((err as any)?.toJSON?.()));
                    } catch {}
                    alert('Lỗi khi từ chối công ty');
                  } finally {
                    setIsProcessing(false);
                  }
                }}
              >
                {isProcessing ? 'Processing...' : 'Reject'}
              </button>

              <DialogClose asChild>
                <button
                  className="px-4 py-2 rounded border"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </button>
              </DialogClose>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ------------------------------------------------------------
// SUB COMPONENTS
// ------------------------------------------------------------
function CompanyStatusBadge({
  status,
}: {
  status: "active" | "inactive" | "pending";
}) {
  let variant: "default" | "secondary" | "destructive" = "secondary";
  let text = "Chờ duyệt";

  if (status === "active") {
    variant = "default";
    text = "Đã duyệt";
  } else if (status === "inactive") {
    variant = "destructive";
    text = "Từ chối";
  }

  return <Badge variant={variant}>{text}</Badge>;
}

