// import React from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { 
//   MapPin, 
//   Users, 
//   Building2,
//   ExternalLink,
//   Eye
// } from 'lucide-react';
// import type { Company } from '@/models/company';

// interface CompanyCardProps {
//   company: Company;
//   onViewDetails?: (companyId: string) => void;
//   className?: string;
// }

// export const CompanyCard: React.FC<CompanyCardProps> = ({
//   company,
//   onViewDetails,
//   className = ''
// }) => {
//   const handleViewDetails = () => {
//     onViewDetails?.(company.id);
//   };

//   return (
//     <Card className={`hover:shadow-lg transition-all duration-200 group cursor-pointer ${className}`}>
//       <CardContent className="p-6">
//         <div className="flex items-start gap-4">
//           {/* Company Logo */}
//           <div className="flex-shrink-0">
//             <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
//               {company.logo ? (
//                 <img 
//                   src={company.logo} 
//                   alt={`${company.name} logo`}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center">
//                   <Building2 className="w-6 h-6 text-gray-400" />
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Company Info */}
//           <div className="flex-1 min-w-0">
//             {/* Header */}
//             <div className="flex items-start justify-between gap-2 mb-2">
//               <div className="flex-1 min-w-0">
//                 <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
//                   {company.name}
//                 </h3>
//                 <Badge 
//                   variant={company.status.ACTIVE === 'active' ? 'default' : 'secondary'}
//                   className="mt-1"
//                 >
//                   {company.status.ACTIVE === 'active' ? 'Đang tuyển dụng' : 'Tạm dừng'}
//                 </Badge>
//               </div>
//             </div>

//             {/* Location */}
//             {company.address && (
//               <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
//                 <MapPin className="w-4 h-4 flex-shrink-0" />
//                 <span className="truncate">
//                   {company.address.split(',').slice(-2).join(',').trim()}
//                 </span>
//               </div>
//             )}

//             {/* Description */}
//             <p className="text-gray-600 text-sm line-clamp-2 mb-3">
//               {company.description}
//             </p>

//             {/* Stats */}
//             <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
//               <div className="flex items-center gap-1">
//                 <Users className="w-3 h-3" />
//                 <span>500+ nhân viên</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <Building2 className="w-3 h-3" />
//                 <span>IT</span>
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={handleViewDetails}
//                 className="flex-1 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors"
//               >
//                 <Eye className="w-4 h-4 mr-2" />
//                 Xem chi tiết
//               </Button>
              
//               {company.website && (
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     window.open(company.website, '_blank');
//                   }}
//                   className="flex-shrink-0"
//                 >
//                   <ExternalLink className="w-4 h-4" />
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };