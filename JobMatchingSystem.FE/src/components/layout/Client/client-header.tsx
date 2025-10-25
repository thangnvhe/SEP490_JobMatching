import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Menu, Mountain } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

export function ClientHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-6 hidden md:flex">
          <Link to="/" className="mr-8 flex items-center space-x-2">
            <Mountain className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">Superio</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList className="space-x-1">
              <NavigationMenuItem>
                <NavigationMenuTrigger>Home</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/about"
                        >
                          <Mountain className="h-6 w-6" />
                          <div className="mb-2 mt-4 text-lg font-medium">
                            Superio
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Find the job that fits your life.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/about" title="Home Page 2">
                      Alternative home page layout.
                    </ListItem>
                    <ListItem href="/about" title="Home Page 3">
                      Another style for the main page.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Find Jobs</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] lg:grid-cols-2">
                    <ListItem href="/about" title="Job List">
                      Browse all available jobs.
                    </ListItem>
                    <ListItem href="/about" title="Job Grid">
                      View jobs in a grid layout.
                    </ListItem>
                    <ListItem href="/about" title="Job Detail">
                      See the details of a specific job.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Employers</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] lg:grid-cols-2">
                    <ListItem href="/about" title="Employer List">
                      See all companies hiring.
                    </ListItem>
                    <ListItem href="/about" title="Employer Grid">
                      View employers in a grid layout.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Candidates</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] lg:grid-cols-2">
                    <ListItem href="/about" title="Candidate List">
                      Browse through candidates.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Can add a search bar here if needed */}
          </div>
          <nav className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" className="text-sm">
              Login / Register
            </Button>
            <Button className="text-sm">Job Post</Button>
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <Link to="/" className="mb-6 flex items-center space-x-2">
              <Mountain className="h-6 w-6" />
              <span className="font-bold">Superio</span>
            </Link>
            <div className="flex flex-col space-y-3">
              <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
                Home
              </Link>
              <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
                Find Jobs
              </Link>
              <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
                Employers
              </Link>
              <Link to="/about" className="text-sm font-medium transition-colors hover:text-primary">
                Candidates
              </Link>
              <Button variant="ghost" className="w-fit text-sm">
                Login / Register
              </Button>
              <Button className="w-fit text-sm">Job Post</Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
