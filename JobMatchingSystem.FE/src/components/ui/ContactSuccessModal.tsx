import React from 'react';
import { CheckCircle, ArrowRight, Building2, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
}

export const ContactSuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  companyName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white rounded-xl shadow-2xl">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Gửi Thành Công!
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Cảm ơn <span className="font-semibold text-gray-900">{companyName}</span> đã gửi thông tin. 
            Chúng tôi sẽ liên hệ với bạn trong vòng <span className="font-semibold text-teal-600">24 giờ</span> để hỗ trợ tốt nhất.
          </p>

          {/* What's Next */}
          <div className="bg-teal-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <ArrowRight className="w-4 h-4 mr-2 text-teal-600" />
              Những bước tiếp theo:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <Building2 className="w-4 h-4 mr-2 mt-0.5 text-teal-600 flex-shrink-0" />
                Đội ngũ của chúng tôi sẽ xem xét thông tin công ty
              </li>
              <li className="flex items-start">
                <Phone className="w-4 h-4 mr-2 mt-0.5 text-teal-600 flex-shrink-0" />
                Liên hệ qua điện thoại để tư vấn giải pháp phù hợp
              </li>
              <li className="flex items-start">
                <Mail className="w-4 h-4 mr-2 mt-0.5 text-teal-600 flex-shrink-0" />
                Gửi thông tin chi tiết về dịch vụ qua email
              </li>
            </ul>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Đóng
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};