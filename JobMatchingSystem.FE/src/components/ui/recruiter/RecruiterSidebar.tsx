// import { Link, useLocation } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Briefcase,
//   Users,
//   Calendar,
//   MessageSquare,
//   FileText,
//   Settings,
//   BarChart3,
//   Building2,
// } from "lucide-react";
// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuItem,
//   SidebarMenuButton,
//   SidebarGroupLabel,
// } from "@/components/ui/sidebar";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { IconInnerShadowTop } from "@tabler/icons-react";
// import { NavUser } from "@/components/ui/Recruiter/RecruiterNavUser";
// import React from "react";

// function useIsActivePath(path: string) {
//   const location = useLocation();
//   return location.pathname.startsWith(path);
// }

// function RecruiterNav() {
//   return (
//     <>
//       <SidebarMenu>
//         <SidebarMenuItem>
//           <SidebarMenuButton
//             asChild
//             isActive={useIsActivePath("/recruiter/dashboard")}
//             tooltip="Dashboard"
//           >
//             <Link to="/recruiter">
//               <LayoutDashboard />
//               <span>Dashboard</span>
//             </Link>
//           </SidebarMenuButton>
//         </SidebarMenuItem>

//         <SidebarMenuItem>
//           <SidebarMenuButton
//             asChild
//             isActive={useIsActivePath("/recruiter/jobs")}
//             tooltip="Manage Jobs"
//           >
//             <Link to="/recruiter/jobs">
//               <Briefcase />
//               <span>Job Postings</span>
//             </Link>
//           </SidebarMenuButton>
//         </SidebarMenuItem>

//         <SidebarMenuItem>
//           <SidebarMenuButton
//             asChild
//             isActive={useIsActivePath("/recruiter/candidates")}
//             tooltip="Candidates"
//           >
//             <Link to="/recruiter/candidates">
//               <Users />
//               <span>Candidates</span>
//             </Link>
//           </SidebarMenuButton>
//         </SidebarMenuItem>

//         <SidebarMenuItem>
//           <SidebarMenuButton
//             asChild
//             isActive={useIsActivePath("/recruiter/interviews")}
//             tooltip="Interviews"
//           >
//             <Link to="/recruiter/interviews">
//               <Calendar />
//               <span>Interviews</span>
//             </Link>
//           </SidebarMenuButton>
//         </SidebarMenuItem>

//         <SidebarMenuItem>
//           <SidebarMenuButton
//             asChild
//             isActive={useIsActivePath("/recruiter/analytics")}
//             tooltip="Analytics"
//           >
//             <Link to="/recruiter/analytics">
//               <BarChart3 />
//               <span>Analytics</span>
//             </Link>
//           </SidebarMenuButton>
//         </SidebarMenuItem>
//       </SidebarMenu>

//       <SidebarGroupLabel className="mt-4">Communication</SidebarGroupLabel>
//       <SidebarMenu>
//         <SidebarMenuItem>
//           <SidebarMenuButton
//             asChild
//             isActive={useIsActivePath("/recruiter/messages")}
//             tooltip="Messages"
//           >
//             <Link to="/recruiter/messages">
//               <MessageSquare />
//               <span>Messages</span>
//             </Link>
//           </SidebarMenuButton>
//         </SidebarMenuItem>

//         <SidebarMenuItem>
//           <SidebarMenuButton
//             asChild
//             isActive={useIsActivePath("/recruiter/reports")}
//             tooltip="Reports"
//           >
//             <Link to="/recruiter/reports">
//               <FileText />
//               <span>Reports</span>
//             </Link>
//           </SidebarMenuButton>
//         </SidebarMenuItem>

//         <SidebarMenuItem>
//           <SidebarMenuButton
//             asChild
//             isActive={useIsActivePath("/recruiter/company")}
//             tooltip="Company Profile"
//           >
//             <Link to="/recruiter/company">
//               <Building2 />
//               <span>Company</span>
//             </Link>
//           </SidebarMenuButton>
//         </SidebarMenuItem>

//         <SidebarMenuItem>
//           <SidebarMenuButton
//             asChild
//             isActive={useIsActivePath("/recruiter/settings")}
//             tooltip="Settings"
//           >
//             <Link to="/recruiter/settings">
//               <Settings />
//               <span>Settings</span>
//             </Link>
//           </SidebarMenuButton>
//         </SidebarMenuItem>
//       </SidebarMenu>
//     </>
//   );
// }

// const dummyUser = {
//   name: "Recruiter",
//   email: "recruiter@company.com",
//   avatar: "https://i.pravatar.cc/150?u=recruiter",
// };

// export function RecruiterSidebar({
//   ...props
// }: React.ComponentProps<typeof Sidebar>) {
//   return (
//     <Sidebar {...props}>
//       <SidebarHeader>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton
//               asChild
//               className="data-[slot=sidebar-menu-button]:p-1.5!"
//             >
//               <a href="#">
//                 <IconInnerShadowTop className="size-5!" />
//                 <span className="text-base font-semibold">Recruiter Dashboard</span>
//               </a>
//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>

//       <ScrollArea className="flex-1">
//         <SidebarContent className="p-0">
//           <RecruiterNav />
//         </SidebarContent>
//       </ScrollArea>

//       <SidebarFooter>
//         <NavUser user={dummyUser} />
//       </SidebarFooter>
//     </Sidebar>
//   );
// }