import {
  Building2,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function ClientFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center mb-4">
              <Building2 className="h-8 w-8 mr-2" />
              <span className="text-2xl font-bold">Superio</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Find the job that fits your life. Start your career with us.
            </p>
            <div className="flex space-x-4">
              <Button variant="outline" size="icon" className="rounded-full">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Candidates</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition">
                  Browse Categories
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition">
                  Candidate Dashboard
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition">
                  Job Alerts
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition">
                  My Bookmarks
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition">
                  Browse Candidates
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition">
                  Add Job
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white transition">
                  Job Packages
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
                <span>123 Main Street, City, Country</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 shrink-0" />
                <span>+1 234 567 8900</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 shrink-0" />
                <span>info@superio.com</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2024 Superio. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="#" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-white transition">
              Terms of Service
            </Link>
            <Link to="#" className="hover:text-white transition">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
