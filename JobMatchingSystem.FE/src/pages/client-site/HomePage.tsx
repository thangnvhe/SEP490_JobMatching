import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Building2,
  Clock,
  MapPin,
  Search,
  Settings2,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";
import { useState } from "react";
import { LoginDialog } from "@/pages/client-site/auth/LoginDialog";
import { RegisterDialog } from "@/pages/client-site/auth/RegisterDialog";
import { ForgotPasswordDialog } from "@/pages/client-site/auth/ForgotPasswordDialog";

const HomePage = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-white pt-2 ">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 leading-tight">
                There Are <span className="text-blue-600">93,178</span> Postings
              Here For you!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Find Jobs, Employment & Career Opportunities.
              </p>
              <Card className="p-4 shadow-lg">
                <CardContent className="p-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="relative md:col-span-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        placeholder="Job title, keywords, or company"
                        className="pl-10 h-12"
                      />
                    </div>

                    <Button className="h-12 text-lg">Find Jobs</Button>
                  </div>
                </CardContent>
              </Card>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <span className="text-gray-500">Popular Searches: </span>
                  <span className="text-gray-700">
                    Designer, Developer, Web, IOS, PHP, Senior, Engineer
                  </span>
                </div>

                <LoginDialog
                  isOpen={loginOpen}
                  onOpenChange={setLoginOpen}
                  onOpenRegister={() => {
                    setLoginOpen(false);
                    setRegisterOpen(true);
                  }}
                  onOpenForgotPassword={() => {
                    setLoginOpen(false);
                    setForgotPasswordOpen(true);
                  }}
                />
                <RegisterDialog
                  isOpen={registerOpen}
                  onOpenChange={setRegisterOpen}
                  onOpenLogin={() => {
                    setRegisterOpen(false);
                    setLoginOpen(true);
                  }}
                />
                <ForgotPasswordDialog
                  isOpen={forgotPasswordOpen}
                  onOpenChange={setForgotPasswordOpen}
                  onOpenLogin={() => {
                    setForgotPasswordOpen(false);
                    setLoginOpen(true);
                  }}
                />
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="public/banner-img-1.png"
                alt="Job search illustration"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Browse Top Categories
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              Find the perfect job in your desired category.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Card
                key={category.title}
                className="group p-6 text-center bg-white border border-gray-100 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-0 flex flex-col items-center">
                  <div className="mb-4 inline-block p-4 bg-blue-50 rounded-lg">
                    <category.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.jobs} open positions
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Featured Jobs
            </h2>
            <p className="text-lg text-gray-600 mt-2">
              Know your worth and find the job that qualify your life
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredJobs.map((job) => (
              <Card
                key={job.id}
                className="group hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <Avatar className="h-14 w-14 mr-4">
                        <AvatarImage src={job.logo} alt={job.company} />
                        <AvatarFallback>
                          {job.company.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {job.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1.5" />{" "}
                            {job.company}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1.5" /> {job.location}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1.5" /> {job.posted}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Bookmark className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    {job.tags.map((tag) => (
                      <Badge
                        key={tag.text}
                        variant="outline"
                        className={tag.className}
                      >
                        {tag.text}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg">
              Load More Listing <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const categories = [
  {
    icon: Users,
    title: "Accounting",
    jobs: 120,
  },
  {
    icon: TrendingUp,
    title: "Marketing",
    jobs: 80,
  },
  {
    icon: Settings2,
    title: "Engineering",
    jobs: 250,
  },
  {
    icon: Warehouse,
    title: "Real Estate",
    jobs: 45,
  },
  {
    icon: Building2,
    title: "Construction",
    jobs: 90,
  },
  {
    icon: Briefcase,
    title: "Business",
    jobs: 150,
  },
];

const featuredJobs = [
  {
    id: 1,
    title: "Software Engineer (Android), Libraries",
    company: "Segment",
    location: "London, UK",
    posted: "11 hours ago",
    salary: "$35k - $45k",
    logo: "https://superio-react.ibthemes.com/images/resource/company-logo-1.png",
    tags: [
      { text: "Full Time", className: "bg-blue-50 text-blue-700" },
      { text: "Private", className: "bg-green-50 text-green-700" },
      { text: "Urgent", className: "bg-yellow-50 text-yellow-700" },
    ],
  },
  {
    id: 2,
    title: "Recruiting Coordinator",
    company: "Catalyst",
    location: "London, UK",
    posted: "11 hours ago",
    salary: "$35k - $45k",
    logo: "https://superio-react.ibthemes.com/images/resource/company-logo-2.png",
    tags: [
      { text: "Freelancer", className: "bg-blue-50 text-blue-700" },
      { text: "Private", className: "bg-green-50 text-green-700" },
      { text: "Urgent", className: "bg-yellow-50 text-yellow-700" },
    ],
  },
  {
    id: 3,
    title: "Product Manager, Studio",
    company: "Invision",
    location: "London, UK",
    posted: "11 hours ago",
    salary: "$35k - $45k",
    logo: "https://superio-react.ibthemes.com/images/resource/company-logo-3.png",
    tags: [
      { text: "Part Time", className: "bg-blue-50 text-blue-700" },
      { text: "Private", className: "bg-green-50 text-green-700" },
      { text: "Urgent", className: "bg-yellow-50 text-yellow-700" },
    ],
  },
  {
    id: 4,
    title: "Senior Product Designer",
    company: "Upwork",
    location: "London, UK",
    posted: "11 hours ago",
    salary: "$35k - $45k",
    logo: "https://superio-react.ibthemes.com/images/resource/company-logo-4.png",
    tags: [
      { text: "Temporary", className: "bg-blue-50 text-blue-700" },
      { text: "Private", className: "bg-green-50 text-green-700" },
      { text: "Urgent", className: "bg-yellow-50 text-yellow-700" },
    ],
  },
  {
    id: 5,
    title: "Senior Full Stack Engineer, Creator Success",
    company: "Medium",
    location: "London, UK",
    posted: "11 hours ago",
    salary: "$35k - $45k",
    logo: "https://superio-react.ibthemes.com/images/resource/company-logo-5.png",
    tags: [
      { text: "Full Time", className: "bg-blue-50 text-blue-700" },
      { text: "Private", className: "bg-green-50 text-green-700" },
      { text: "Urgent", className: "bg-yellow-50 text-yellow-700" },
    ],
  },
  {
    id: 6,
    title: "Software Engineer (Android), Libraries",
    company: "Figma",
    location: "London, UK",
    posted: "11 hours ago",
    salary: "$35k - $45k",
    logo: "https://superio-react.ibthemes.com/images/resource/company-logo-6.png",
    tags: [
      { text: "Freelancer", className: "bg-blue-50 text-blue-700" },
      { text: "Private", className: "bg-green-50 text-green-700" },
      { text: "Urgent", className: "bg-yellow-50 text-yellow-700" },
    ],
  },
];

export default HomePage;
