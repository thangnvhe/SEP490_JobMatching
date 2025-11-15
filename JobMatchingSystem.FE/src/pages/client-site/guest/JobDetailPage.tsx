// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";

// // --- IMPORTS ĐÃ GỘP ---

// // UI Components
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { JobCard } from "@/components/ui/jobs/JobCard"; // Import từ SimilarJobs

// // Icons (Gộp từ tất cả các file)
// import {
//   ArrowLeft,
//   MapPin,
//   Clock,
//   Briefcase,
//   Heart,
//   Share2,
//   Building,
//   CheckCircle,
//   ArrowRight,
//   Users,
//   Globe,
//   Calendar,
//   ExternalLink,
// } from "lucide-react";

// // Service
// import { jobService } from "@/services/test-services/jobService";

// // Type (Chuẩn hóa thành 'Job')
// import type { JobTest as Job } from "@/models/job";

// // --- KẾT THÚC IMPORTS ---

// // -----------------------------------------------------------------
// // COMPONENT 1: JobDetailHeader (đã xóa 'export', cập nhật type)
// // -----------------------------------------------------------------

// interface JobDetailHeaderProps {
//   job: Job; // <- Đã đổi từ JobTest sang Job
//   onBack: () => void;
//   onApply: () => void;
//   onSave?: () => void;
//   onShare?: () => void;
//   isSaved?: boolean;
//   className?: string;
// }

// const JobDetailHeader: React.FC<JobDetailHeaderProps> = ({
//   job,
//   onBack,
//   onApply,
//   onSave,
//   onShare,
//   isSaved = false,
//   className = "",
// }) => {
//   const formatTimeAgo = (dateString: string) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInMinutes = Math.floor(
//       (now.getTime() - date.getTime()) / (1000 * 60)
//     );

//     if (diffInMinutes < 60) {
//       return `${diffInMinutes} min ago`;
//     } else if (diffInMinutes < 1440) {
//       const hours = Math.floor(diffInMinutes / 60);
//       return `${hours} hour${hours > 1 ? "s" : ""} ago`;
//     } else {
//       const days = Math.floor(diffInMinutes / 1440);
//       return `${days} day${days > 1 ? "s" : ""} ago`;
//     }
//   };



//   return (
//     <Card className={`bg-white border-none shadow-sm ${className}`}>
//       <CardContent className="p-8">
//         {/* Back Button */}
//         <div className="mb-6">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={onBack}
//             className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-0"
//           >
//             <ArrowLeft className="h-4 w-4" />
//             <span>Back to Jobs</span>
//           </Button>
//         </div>

//         <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
//           {/* Left Section - Job Info */}
//           <div className="flex-1">
//             <div className="flex items-start space-x-4 mb-6">
//               {/* Company Logo */}
//               <div className="flex-shrink-0">
//                 {job.company.logo ? (
//                   <img
//                     src={job.company.logo}
//                     alt={job.company.name}
//                     className="w-16 h-16 rounded-xl object-cover border border-gray-200"
//                   />
//                 ) : (
//                   <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
//                     <span className="text-white font-semibold text-xl">
//                       {job.company.name.charAt(0).toUpperCase()}
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* Job Title and Company */}
//               <div className="flex-1">
//                 <div className="flex items-center space-x-3 mb-2">
//                   <h1 className="text-xl font-bold text-gray-900">
//                     {job.title}
//                   </h1>
//                   {job.isUrgent && (
//                     <Badge
//                       variant="destructive"
//                       className="bg-red-50 text-red-700 border border-red-200"
//                     >
//                       Urgent
//                     </Badge>
//                   )}
//                 </div>

//                 <div className="flex items-center space-x-2 mb-4">
//                   <Building className="h-5 w-5 text-gray-500" />
//                   <span className="text-lg text-gray-700 font-medium">
//                     {job.company.name}
//                   </span>
//                 </div>

//                 <div className="flex items-center text-sm text-gray-500">
//                   <Clock className="h-4 w-4 mr-1" />
//                   <span>Posted {formatTimeAgo(job.postedDate)}</span>
//                   {job.applicationCount && (
//                     <>
//                       <Separator orientation="vertical" className="h-4 mx-3" />
//                       <span>{job.applicationCount} applications</span>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>



//             {/* Tags */}
//             {job.tags && job.tags.length > 0 && (
//               <div className="flex flex-wrap gap-2">
//                 {job.tags.map((tag, index) => (
//                   <Badge
//                     key={index}
//                     variant="outline"
//                     className="bg-emerald-50 text-emerald-700 border-emerald-200"
//                   >
//                     {tag}
//                   </Badge>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Right Section - Action Buttons */}
//           <div className="flex flex-col space-y-3 lg:w-48">
//             <Button
//               onClick={onApply}
//               className="bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-3 h-12"
//             >
//               Apply Now
//             </Button>

//             <div className="flex space-x-2">
//               {onSave && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={onSave}
//                   className={`flex-1 border-gray-300 ${
//                     isSaved
//                       ? "text-red-600 border-red-300 bg-red-50"
//                       : "text-gray-600 hover:text-red-600"
//                   }`}
//                 >
//                   <Heart
//                     className={`h-4 w-4 mr-2 ${isSaved ? "fill-current" : ""}`}
//                   />
//                   {isSaved ? "Saved" : "Save"}
//                 </Button>
//               )}

//               {onShare && (
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={onShare}
//                   className="flex-1 border-gray-300 text-gray-600 hover:text-gray-900"
//                 >
//                   <Share2 className="h-4 w-4 mr-2" />
//                   Share
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// // -----------------------------------------------------------------
// // COMPONENT 2: JobDescription (đã xóa 'export', cập nhật type)
// // -----------------------------------------------------------------

// interface JobDescriptionProps {
//   job: Job; // <- Đã đổi từ JobTest sang Job
//   className?: string;
// }

// const JobDescription: React.FC<JobDescriptionProps> = ({
//   job,
//   className = "",
// }) => {
//   // Helper function to render formatted text
//   const renderFormattedText = (text: string) => {
//     return text.split("\n").map((line, index) => (
//       <p key={index} className="mb-3 last:mb-0 text-gray-700 leading-relaxed">
//         {line}
//       </p>
//     ));
//   };

//   // Helper function to render list items
//   const renderListItems = (items: string[]) => {
//     return (
//       <ul className="space-y-2">
//         {items.map((item, index) => (
//           <li key={index} className="flex items-start space-x-3">
//             <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
//             <span className="text-gray-700 leading-relaxed">{item}</span>
//           </li>
//         ))}
//       </ul>
//     );
//   };



//   return (
//     <div className={`space-y-6 ${className}`}>
//       {/* Job Description & Requirements */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-xl font-semibold text-gray-900">
//             Job Description & Requirements
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <div className="prose max-w-none">
//             {typeof job.description === "string" ? (
//               renderFormattedText(job.description)
//             ) : (
//               <p className="text-gray-700 leading-relaxed">{job.description}</p>
//             )}
//           </div>
          
//           {job.requirements && job.requirements.length > 0 && (
//             <div>
//               <h4 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h4>
//               {renderListItems(job.requirements)}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Benefits */}
//       {job.benefits && job.benefits.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-xl font-semibold text-gray-900">
//               Benefits & Perks
//             </CardTitle>
//           </CardHeader>
//           <CardContent>{renderListItems(job.benefits)}</CardContent>
//         </Card>
//       )}

//       {/* Work Info */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
//             <Briefcase className="h-5 w-5 text-emerald-600" />
//             <span>Work Info</span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-4">
//               <div>
//                 <h4 className="text-sm font-medium text-gray-500 mb-1">
//                   Category
//                 </h4>
//                 <Badge
//                   variant="outline"
//                   className="bg-emerald-50 text-emerald-700 border-emerald-200"
//                 >
//                   {job.category.name}
//                 </Badge>
//               </div>

//               <div>
//                 <h4 className="text-sm font-medium text-gray-500 mb-1">
//                   Job Type
//                 </h4>
//                 <p className="text-gray-900 font-medium">{job.jobType.name}</p>
//               </div>

//               <div>
//                 <h4 className="text-sm font-medium text-gray-500 mb-1">
//                   Experience Level
//                 </h4>
//                 <p className="text-gray-900 font-medium">
//                   {job.experienceLevel.name}
//                 </p>
//               </div>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <h4 className="text-sm font-medium text-gray-500 mb-1">
//                   Location
//                 </h4>
//                 <p className="text-gray-900 font-medium">
//                   {job.location.city}, {job.location.country}
//                   {job.location.isRemote && (
//                     <Badge
//                       variant="outline"
//                       className="ml-2 bg-blue-50 text-blue-700 border-blue-200"
//                     >
//                       Remote
//                     </Badge>
//                   )}
//                 </p>
//               </div>

//               <div>
//                 <h4 className="text-sm font-medium text-gray-500 mb-1">
//                   Salary Range
//                 </h4>
//                 <p className="text-gray-900 font-medium">
//                   {job.salary.currency}
//                   {job.salary.min.toLocaleString()} - {job.salary.currency}
//                   {job.salary.max.toLocaleString()}
//                 </p>
//               </div>

//               <div>
//                 <h4 className="text-sm font-medium text-gray-500 mb-1 flex items-center space-x-1">
//                   <Clock className="h-4 w-4" />
//                   <span>Application Deadline</span>
//                 </h4>
//                 <p className="text-gray-900 font-medium">
//                   {new Date(job.expiryDate).toLocaleDateString()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//     </div>
//   );
// };

// // -----------------------------------------------------------------
// // COMPONENT 3: SimilarJobs (đã xóa 'export', cập nhật type)
// // -----------------------------------------------------------------

// interface SimilarJobsProps {
//   jobs: Job[]; // <- Đã đổi từ JobTest sang Job
//   currentJobId: string;
//   onJobDetails: (jobId: string) => void;
//   onSaveJob?: (jobId: string) => void;
//   onViewAllJobs?: () => void;
//   loading?: boolean;
//   className?: string;
// }

// const SimilarJobs: React.FC<SimilarJobsProps> = ({
//   jobs,
//   currentJobId,
//   onJobDetails,
//   onSaveJob,
//   onViewAllJobs,
//   loading = false,
//   className = "",
// }) => {
//   // Filter out current job and limit to 3 similar jobs
//   const similarJobs = jobs.filter((job) => job.id !== currentJobId).slice(0, 3);

//   if (loading) {
//     return (
//       <Card className={className}>
//         <CardHeader>
//           <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
//             <Briefcase className="h-5 w-5 text-emerald-600" />
//             <span>Similar Jobs</span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {[...Array(3)].map((_, index) => (
//               <div
//                 key={index}
//                 className="bg-white rounded-xl p-6 border border-gray-100"
//               >
//                 <div className="space-y-4 animate-pulse">
//                   <div className="flex justify-between">
//                     <div className="h-4 bg-gray-200 rounded w-24"></div>
//                     <div className="h-6 bg-gray-200 rounded w-6"></div>
//                   </div>
//                   <div className="flex space-x-4">
//                     <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
//                     <div className="space-y-2 flex-1">
//                       <div className="h-5 bg-gray-200 rounded w-3/4"></div>
//                       <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//                     </div>
//                   </div>
//                   <div className="flex justify-between">
//                     <div className="flex space-x-4">
//                       {[...Array(3)].map((_, i) => (
//                         <div
//                           key={i}
//                           className="h-4 bg-gray-200 rounded w-16"
//                         ></div>
//                       ))}
//                     </div>
//                     <div className="h-8 bg-gray-200 rounded w-20"></div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (similarJobs.length === 0) {
//     return (
//       <Card className={className}>
//         <CardHeader>
//           <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
//             <Briefcase className="h-5 w-5 text-emerald-600" />
//             <span>Similar Jobs</span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="text-center py-8">
//             <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
//               <Briefcase className="w-8 h-8 text-gray-400" />
//             </div>
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               No Similar Jobs
//             </h3>
//             <p className="text-gray-600 mb-4">
//               We couldn't find similar jobs at the moment.
//             </p>
//             {onViewAllJobs && (
//               <Button
//                 variant="outline"
//                 onClick={onViewAllJobs}
//                 className="border-emerald-300 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
//               >
//                 Browse All Jobs
//               </Button>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className={className}>
//       <CardHeader className="flex flex-row items-center justify-between">
//         <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
//           <Briefcase className="h-5 w-5 text-emerald-600" />
//           <span>Similar Jobs</span>
//         </CardTitle>
//         {onViewAllJobs && similarJobs.length > 0 && (
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={onViewAllJobs}
//             className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
//           >
//             View All
//             <ArrowRight className="h-4 w-4 ml-1" />
//           </Button>
//         )}
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {similarJobs.map((job) => (
//             <JobCard
//               key={job.id}
//               job={job}
//               onJobDetails={onJobDetails}
//               onSaveJob={onSaveJob}
//               className="shadow-sm hover:shadow-md transition-shadow duration-200"
//             />
//           ))}
//         </div>

//         {/* View More Button */}
//         {onViewAllJobs && similarJobs.length >= 3 && (
//           <div className="mt-6 text-center">
//             <Button
//               variant="outline"
//               onClick={onViewAllJobs}
//               className="w-full border-emerald-300 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
//             >
//               <Briefcase className="h-4 w-4 mr-2" />
//               View More Similar Jobs
//               <ArrowRight className="h-4 w-4 ml-2" />
//             </Button>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// // -----------------------------------------------------------------
// // COMPONENT 4: CompanyInfo (Component này đã có sẵn trong file của bạn)
// // -----------------------------------------------------------------

// interface CompanyInfoProps {
//   job: Job;
//   onViewAllJobs?: () => void;
//   className?: string;
// }

// const CompanyInfo: React.FC<CompanyInfoProps> = ({
//   job,
//   onViewAllJobs,
//   className = "",
// }) => {
//   // Mock company data
//   const companyData = {
//     id: job.company.id,
//     name: job.company.name,
//     logo: job.company.logo,
//     description:
//       "We are a leading technology company focused on delivering innovative solutions that transform businesses and improve people's lives. Our team of experts works with cutting-edge technologies to create products that make a difference.",
//     website: "https://example.com",
//     employees: "1000-5000",
//     founded: "2010",
//     industry: job.category.name,
//     locations: [`${job.location.city}, ${job.location.country}`, "Remote"],
//     totalJobs: 25,
//     culture: ["Innovation", "Teamwork", "Growth", "Diversity"],
//   };

//   return (
//     <Card className={className}>
//       <CardHeader>
//         <CardTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
//           <Building className="h-5 w-5 text-emerald-600" />
//           <span>About {job.company.name}</span>
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* Company Header */}
//         <div className="flex items-start space-x-4">
//           <div className="flex-shrink-0">
//             {job.company.logo ? (
//               <img
//                 src={job.company.logo}
//                 alt={job.company.name}
//                 className="w-16 h-16 rounded-xl object-cover border border-gray-200"
//               />
//             ) : (
//               <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
//                 <span className="text-white font-semibold text-xl">
//                   {job.company.name.charAt(0).toUpperCase()}
//                 </span>
//               </div>
//             )}
//           </div>

//           <div className="flex-1">
//             <h3 className="text-lg font-semibold text-gray-900 mb-2">
//               {job.company.name}
//             </h3>
//             <p className="text-gray-600 text-sm leading-relaxed">
//               {companyData.description}
//             </p>
//           </div>
//         </div>

//         {/* Company Stats */}
//         <div className="grid grid-cols-2 gap-4">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
//               <Users className="h-5 w-5 text-blue-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Company Size</p>
//               <p className="font-medium text-gray-900">
//                 {companyData.employees}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
//               <Calendar className="h-5 w-5 text-purple-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Founded</p>
//               <p className="font-medium text-gray-900">{companyData.founded}</p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
//               <Building className="h-5 w-5 text-green-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Industry</p>
//               <p className="font-medium text-gray-900">
//                 {companyData.industry}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
//               <MapPin className="h-5 w-5 text-orange-600" />
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Locations</p>
//               <p className="font-medium text-gray-900">
//                 {companyData.locations.join(", ")}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Company Culture */}
//         <div>
//           <h4 className="text-sm font-medium text-gray-500 mb-3">
//             Company Culture
//           </h4>
//           <div className="flex flex-wrap gap-2">
//             {companyData.culture.map((value, index) => (
//               <Badge
//                 key={index}
//                 variant="outline"
//                 className="bg-emerald-50 text-emerald-700 border-emerald-200"
//               >
//                 {value}
//               </Badge>
//             ))}
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
//           <Button
//             variant="outline"
//             className="flex-1 border-gray-300 text-gray-700 hover:text-gray-900"
//             onClick={() => window.open(companyData.website, "_blank")}
//           >
//             <Globe className="h-4 w-4 mr-2" />
//             Visit Website
//             <ExternalLink className="h-3 w-3 ml-1" />
//           </Button>

//           {onViewAllJobs && (
//             <Button
//               variant="outline"
//               className="flex-1 border-emerald-300 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
//               onClick={onViewAllJobs}
//             >
//               <Building className="h-4 w-4 mr-2" />
//               View All Jobs ({companyData.totalJobs})
//             </Button>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// // -----------------------------------------------------------------
// // COMPONENT 5: JobDetailPage (Component chính, sử dụng các component trên)
// // -----------------------------------------------------------------

// const JobDetailPage: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   // State management
//   const [job, setJob] = useState<Job | null>(null);
//   const [similarJobs, setSimilarJobs] = useState<Job[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [similarJobsLoading, setSimilarJobsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isSaved, setIsSaved] = useState(false);

//   // Load job details and similar jobs
//   useEffect(() => {
//     const loadJobDetails = async () => {
//       if (!id) {
//         setError("Job ID not provided");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);

//         // Load job details
//         const jobData = await jobService.getJobById(id);

//         if (!jobData) {
//           setError("Job not found");
//           setLoading(false);
//           return;
//         }

//         setJob(jobData);
//         setLoading(false);

//         // Load similar jobs in parallel
//         setSimilarJobsLoading(true);
//         try {
//           const similarJobsData = await jobService.getSimilarJobs(id, 6);
//           setSimilarJobs(similarJobsData);
//         } catch (error) {
//           console.error("Error loading similar jobs:", error);
//           // Don't show error for similar jobs, just leave empty
//         } finally {
//           setSimilarJobsLoading(false);
//         }
//       } catch (error) {
//         console.error("Error loading job details:", error);
//         setError("Failed to load job details. Please try again.");
//         setLoading(false);
//       }
//     };

//     loadJobDetails();
//   }, [id]);

//   // Handle navigation back to jobs list
//   const handleBack = () => {
//     navigate("/jobs");
//   };

//   // Handle job application
//   const handleApply = async () => {
//     if (!job) return;

//     try {
//       await jobService.applyToJob(job.id);
//       // In a real app, you might show a success message or redirect to application form
//       console.log("Application submitted successfully!");
//       alert("Application submitted successfully!");
//     } catch (error) {
//       console.error("Error applying to job:", error);
//       alert("Failed to submit application. Please try again.");
//     }
//   };

//   // Handle save/unsave job
//   const handleSaveJob = async () => {
//     if (!job) return;

//     try {
//       if (isSaved) {
//         await jobService.unsaveJob(job.id);
//         setIsSaved(false);
//         console.log("Job removed from saved jobs");
//       } else {
//         await jobService.saveJob(job.id);
//         setIsSaved(true);
//         console.log("Job saved successfully!");
//       }
//     } catch (error) {
//       console.error("Error saving/unsaving job:", error);
//       alert("Failed to save job. Please try again.");
//     }
//   };

//   // Handle share job
//   const handleShareJob = async () => {
//     if (!job) return;

//     try {
//       if (navigator.share) {
//         await navigator.share({
//           title: job.title,
//           text: `Check out this job opportunity: ${job.title} at ${job.company.name}`,
//           url: window.location.href,
//         });
//       } else {
//         // Fallback: copy to clipboard
//         await navigator.clipboard.writeText(window.location.href);
//         alert("Job link copied to clipboard!");
//       }
//     } catch (error) {
//       console.error("Error sharing job:", error);
//       // Fallback to manual copy
//       try {
//         await navigator.clipboard.writeText(window.location.href);
//         alert("Job link copied to clipboard!");
//       } catch (clipboardError) {
//         console.error("Clipboard access failed:", clipboardError);
//       }
//     }
//   };

//   // Handle similar job click
//   const handleSimilarJobClick = (jobId: string) => {
//     navigate(`/jobs/${jobId}`);
//   };

//   // Handle view all jobs from company
//   const handleViewCompanyJobs = () => {
//     if (!job) return;
//     navigate(`/jobs?company=${job.company.id}`);
//   };

//   // Handle view all similar jobs
//   const handleViewAllSimilarJobs = () => {
//     if (!job) return;
//     navigate(
//       `/jobs?category=${job.category.id}&experience=${job.experienceLevel.id}`
//     );
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <div className="max-w-7xl mx-auto px-6 py-8">
//           <div className="space-y-6">
//             {/* Header skeleton */}
//             <div className="bg-white rounded-xl p-8 shadow-sm">
//               <div className="animate-pulse space-y-6">
//                 <div className="h-6 bg-gray-200 rounded w-32"></div>
//                 <div className="flex space-x-4">
//                   <div className="h-16 w-16 bg-gray-200 rounded-xl"></div>
//                   <div className="flex-1 space-y-2">
//                     <div className="h-8 bg-gray-200 rounded w-3/4"></div>
//                     <div className="h-5 bg-gray-200 rounded w-1/2"></div>
//                     <div className="h-4 bg-gray-200 rounded w-1/3"></div>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-4 gap-6">
//                   {[...Array(4)].map((_, i) => (
//                     <div key={i} className="space-y-2">
//                       <div className="h-4 bg-gray-200 rounded w-full"></div>
//                       <div className="h-5 bg-gray-200 rounded w-3/4"></div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Content skeleton */}
//             <div className="flex gap-6">
//               <div className="flex-1 space-y-6">
//                 {[...Array(3)].map((_, i) => (
//                   <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
//                     <div className="animate-pulse space-y-4">
//                       <div className="h-6 bg-gray-200 rounded w-1/4"></div>
//                       <div className="space-y-2">
//                         <div className="h-4 bg-gray-200 rounded w-full"></div>
//                         <div className="h-4 bg-gray-200 rounded w-5/6"></div>
//                         <div className="h-4 bg-gray-200 rounded w-4/6"></div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//               <div className="w-80 space-y-6">
//                 {[...Array(2)].map((_, i) => (
//                   <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
//                     <div className="animate-pulse space-y-4">
//                       <div className="h-6 bg-gray-200 rounded w-3/4"></div>
//                       <div className="space-y-2">
//                         <div className="h-4 bg-gray-200 rounded w-full"></div>
//                         <div className="h-4 bg-gray-200 rounded w-2/3"></div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error || !job) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
//             <svg
//               className="w-12 h-12 text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
//               />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-semibold text-gray-900 mb-2">
//             {error || "Job Not Found"}
//           </h2>
//           <p className="text-gray-600 mb-6">
//             {error ||
//               "The job you're looking for doesn't exist or has been removed."}
//           </p>
//           <button
//             onClick={handleBack}
//             className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors"
//           >
//             Back to Jobs
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Render khi có dữ liệu
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="space-y-6">
//           {/* Job Header (Giờ là component nội bộ) */}
//           <JobDetailHeader
//             job={job}
//             onBack={handleBack}
//             onApply={handleApply}
//             onSave={handleSaveJob}
//             onShare={handleShareJob}
//             isSaved={isSaved}
//           />

//           {/* Main Content */}
//           <div className="flex flex-col lg:flex-row gap-6">
//             {/* Left Column - Job Details */}
//             <div className="flex-1">
//               {/* Job Description (Giờ là component nội bộ) */}
//               <JobDescription job={job} />
//             </div>

//             {/* Right Column - Company Info & Similar Jobs */}
//             <div className="w-full lg:w-80 space-y-6">
//               {/* CompanyInfo (Đã có sẵn) */}
//               <CompanyInfo job={job} onViewAllJobs={handleViewCompanyJobs} />

//               {/* SimilarJobs (Giờ là component nội bộ) */}
//               <SimilarJobs
//                 jobs={similarJobs}
//                 currentJobId={job.id}
//                 onJobDetails={handleSimilarJobClick}
//                 onSaveJob={handleSaveJob}
//                 onViewAllJobs={handleViewAllSimilarJobs}
//                 loading={similarJobsLoading}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JobDetailPage;
