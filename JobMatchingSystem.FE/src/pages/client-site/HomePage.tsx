import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Bookmark,
  Briefcase,
  Building2,
  MapPin,
  Search,
  Settings2,
  TrendingUp,
  Users,
  Warehouse,
  Layers,
  DollarSign,
  Star,
  Award,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LoginDialog } from "@/pages/client-site/auth/LoginDialog";
import { RegisterDialog } from "@/pages/client-site/auth/RegisterDialog";
import { ForgotPasswordDialog } from "@/pages/client-site/auth/ForgotPasswordDialog";
import { JobServices } from "@/services/job.service";
import { CompanyServices } from "@/services/company.service";
import { TaxonomyService } from "@/services/taxonomy.service";
import { shortenAddress } from "@/utils/addressUtils";
import type { Job } from "@/models/job";
import type { Company } from "@/models/company";
import type { Taxonomy } from "@/models/taxonomy";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taxRes, jobRes, compRes] = await Promise.all([
          TaxonomyService.getAllTaxonomies(),
          JobServices.getAllWithPagination({ page: 1, size: 6 }),
          CompanyServices.getAllCompanies({ page: 1, size: 8 }),
        ]);

        if (taxRes.result) {
          setTaxonomies(taxRes.result.slice(0, 10));
        }
        if (jobRes.result && jobRes.result.items) {
          setJobs(jobRes.result.items);
        }
        if (compRes.result && compRes.result.items) {
          setCompanies(compRes.result.items);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const getCategoryIcon = (index: number) => {
    const icons = [
      Users,
      TrendingUp,
      Settings2,
      Warehouse,
      Building2,
      Briefcase,
      Layers,
    ];
    return icons[index % icons.length];
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Section */}
      <section className="relative pt-14 pb-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white -z-10" />
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-emerald-700 bg-emerald-100 hover:bg-emerald-200 transition-colors">
                <span className="mr-2">🚀</span> #1 Job Board for Hiring
              </Badge>
              <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Dream Job</span> <br />
                Today!
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-lg">
                Connect with thousands of employers and find the perfect opportunity that matches your skills and aspirations.
              </p>

              <div className="bg-white p-2 rounded-2xl shadow-xl shadow-emerald-900/5 border border-slate-100 max-w-xl mb-8">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      placeholder="Job title, keywords..."
                      className="pl-12 h-14 border-transparent bg-slate-50 focus-visible:ring-0 focus-visible:bg-white transition-colors text-base rounded-xl"
                    />
                  </div>
                  <Button size="lg" className="h-14 px-8 rounded-xl text-base font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]">
                    Search Jobs
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="font-medium">Popular:</span>
                <div className="flex flex-wrap gap-2">
                  {['Designer', 'Developer', 'Manager'].map((tag) => (
                    <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-white hover:border-emerald-200 transition-all">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full blur-3xl opacity-30 animate-pulse" />
              <img
                src="/banner-img-1.png"
                alt="Job search illustration"
                className="relative w-full h-auto drop-shadow-2xl hover:scale-[1.01] transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

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

      {/* Categories Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Explore by Category
              </h2>
              <p className="text-lg text-slate-600">
                Find the perfect role based on your expertise
              </p>
            </div>
            <Button variant="outline" className="hidden md:flex hover:text-emerald-600 hover:border-emerald-200">View All Categories</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {taxonomies.map((category, index) => {
              const Icon = getCategoryIcon(index);
              return (
                <Card
                  key={category.id}
                  className="group hover:shadow-xl hover:shadow-emerald-900/5 hover:-translate-y-1 transition-all duration-300 border-slate-200 cursor-pointer bg-white"
                >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="mb-4 p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 transition-colors duration-300">
                      <Icon className="h-8 w-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">100+ Jobs</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwIDIuMjA5LTEuNzkxIDQtNCA0cy00LTEuNzkxLTQtNCAxLjc5MS00IDQtNCA0IDEuNzkxIDQgNHoiIGZpbGw9IiMxMGI5ODEiIG9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 px-4 py-1.5">
                <Star className="h-3.5 w-3.5 mr-1.5 fill-emerald-600" />
                Featured Jobs
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Latest Job Opportunities
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Hand-picked jobs just for you. Find the one that matches your skills and passion.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <Card
                key={job.jobId}
                className="group hover:shadow-xl hover:shadow-emerald-900/10 hover:-translate-y-1 transition-all duration-300 border-slate-200 overflow-hidden bg-white relative h-full flex flex-col"
              >
                {/* Decorative accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
                
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex gap-5 flex-1">
                    <div className="relative shrink-0">
                      <Avatar className="h-20 w-20 rounded-2xl border-2 border-emerald-100 shadow-md group-hover:border-emerald-200 transition-colors">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${job.title}`} />
                        <AvatarFallback className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-2xl">
                          {job.title.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {job.jobType === 'FullTime' && (
                        <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 shadow-lg">
                          <Star className="h-3 w-3 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2 line-clamp-2 min-h-14">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-3">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                              <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="font-medium">Tech Company</span>
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg max-w-full">
                              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[200px]">{shortenAddress(job.location)}</span>
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 -mt-1 -mr-1 transition-colors shrink-0"
                        >
                          <Bookmark className="h-5 w-5" />
                        </Button>
                      </div>
                      
                      {/* Salary and Job Type */}
                      <div className="flex items-center gap-2 flex-wrap mb-2 min-h-8">
                        <Badge 
                          variant="secondary" 
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 font-semibold px-3 py-1"
                        >
                          <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                          {job.jobType}
                        </Badge>
                        {job.salaryMin && job.salaryMax ? (
                          <Badge 
                            variant="secondary" 
                            className="bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 hover:from-emerald-100 hover:to-teal-100 border-0 font-semibold px-3 py-1"
                          >
                            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                            ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                          </Badge>
                        ) : (
                          <Badge 
                            variant="secondary" 
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 font-semibold px-3 py-1"
                          >
                            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                            Negotiable
                          </Badge>
                        )}
                        {job.experienceYear ? (
                          <Badge variant="outline" className="border-emerald-200 text-slate-700 px-3 py-1">
                            <Award className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                            {job.experienceYear}+ Years
                          </Badge>
                        ) : (
                          <div className="w-0 h-0" />
                        )}
                      </div>

                      {/* Taxonomies */}
                      <div className="flex items-center gap-2 flex-wrap mb-4 min-h-7">
                        {job.taxonomies && job.taxonomies.length > 0 ? (
                          <>
                            {job.taxonomies.slice(0, 3).map((tax) => (
                              <Badge 
                                key={tax.id} 
                                variant="outline" 
                                className="border-slate-200 text-slate-600 hover:border-emerald-200 hover:text-emerald-600 transition-colors px-2.5 py-0.5"
                              >
                                {tax.name}
                              </Badge>
                            ))}
                            {job.taxonomies.length > 3 && (
                              <Badge variant="outline" className="border-slate-200 text-slate-500 px-2.5 py-0.5">
                                +{job.taxonomies.length - 3} more
                              </Badge>
                            )}
                          </>
                        ) : (
                          <div className="w-0 h-0" />
                        )}
                      </div>

                      {/* Footer with date and apply button - Always at bottom */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 h-8 text-sm font-semibold shadow-sm shadow-emerald-600/20 shrink-0"
                        >
                          Apply Now
                          <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="sm"
              variant="outline"
              className="  hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 px-8 h-12 text-base font-semibold shadow-sm"
              onClick={() => navigate('/jobs')}
            >
              View All Jobs
            </Button>
          </div>
        </div>
      </section>

      {/* Top Companies Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Top Hiring Companies
            </h2>
            <p className="text-lg text-slate-600">
              Work with the best global companies
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {companies.map((company) => (
              <Card
                key={company.id}
                className="group hover:-translate-y-2 transition-all duration-300 border-slate-200 overflow-hidden bg-white hover:shadow-xl hover:shadow-emerald-900/5"
              >
                <div className="h-24 bg-gradient-to-br from-emerald-50 to-teal-50 transition-colors" />
                <CardContent className="p-6 pt-0 flex flex-col items-center text-center -mt-12">
                  <Avatar className="h-24 w-24 rounded-2xl  border-white shadow-md mb-4 bg-white">
                    <AvatarImage src={company.logo} alt={company.name} className="object-contain p-2" />
                    <AvatarFallback className="bg-slate-100 text-slate-600 text-2xl font-bold rounded-2xl">
                      {company.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="text-xl font-bold text-emerald-900 mb-1 group-hover:text-emerald-600 transition-colors">
                    {company.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[180px]">{shortenAddress(company.address) || 'Headquarters'}</span>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-2 mb-6 text-center">
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="text-xs text-slate-500">Open Jobs</div>
                      <div className="font-semibold text-emerald-600">3</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg">
                      <div className="text-xs text-slate-500">Rating</div>
                      <div className="font-semibold text-yellow-500">4.5</div>
                    </div>
                  </div>

                  <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors rounded-xl">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
