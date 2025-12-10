/**
 * Rút gọn địa chỉ bằng cách loại bỏ các thông tin không cần thiết
 * @param address - Địa chỉ đầy đủ cần rút gọn
 * @returns Địa chỉ đã được rút gọn
 */
export function shortenAddress(address: string | null | undefined): string {
  if (!address) return "";

  // Tách theo dấu phẩy
  let parts = address.split(',').map(p => p.trim());

  const removeKeywords = ["Phường", "Phường.", "Xã", "Phường ", "Vietnam", "Việt Nam"];

  // Lọc bỏ phần phường, xã, Việt Nam
  parts = parts.filter(p =>
    !removeKeywords.some(k => p.startsWith(k))
  );

  // Chuẩn hóa TP.HCM
  parts = parts.map(p => {
    if (p === "Thành phố Hồ Chí Minh" || p === "Ho Chi Minh City") {
      return "TP.HCM";
    }
    return p;
  });

  // Nếu thấy "Quận 7" thì giữ nguyên
  // Các phần như Tòa nhà, Tầng, Số đường giữ nguyên
  return parts.join(', ');
}

