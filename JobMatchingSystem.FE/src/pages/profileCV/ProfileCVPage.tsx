import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    Award,
    BadgeCheck,
    Briefcase,
    Calendar,
    ChevronDown,
    Edit,
    GraduationCap,
    Languages,
    Mail,
    MapPin,
    Phone,
    Plus,
    PlusCircle,
    Projector,
    User as UserIcon,
    UserCircle2,
    Wrench,
} from "lucide-react";

const ProfileCvPage = () => {
    const [showMoreActions, setShowMoreActions] = useState(false);

    return (
        <div className="bg-gray-50/50 min-h-screen p-4 sm:p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile strength */}
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between gap-6 border-b">
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                                Profile Strength
                            </CardTitle>
                            <CardDescription>
                                Hoàn thành hồ sơ tới{" "}
                                <span className="font-semibold text-red-500">70%</span> để tạo CV mẫu cho IT.
                            </CardDescription>
                        </div>
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[conic-gradient(#ef4444_0deg,#ef4444_36deg,#e5e7eb_36deg,#e5e7eb_360deg)]">
                            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white text-center">
                                <span className="text-xl font-semibold text-gray-900">10%</span>
                                <span className="text-xs text-gray-500">completed</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <Collapsible
                            open={showMoreActions}
                            onOpenChange={setShowMoreActions}
                            className="space-y-3"
                        >
                            <div className="space-y-3 text-sm">
                                <ProfileActionRow label="Add About me" />
                                <ProfileActionRow label="Add Work Experience" />
                                <ProfileActionRow label="Add Education" />
                                <CollapsibleContent className="space-y-3">
                                    <ProfileActionRow label="Add Skills" />
                                    <ProfileActionRow label="Add Foreign Language" />
                                    <ProfileActionRow label="Add Certificates" />
                                    <ProfileActionRow label="Add Awards" />
                                    <ProfileActionRow label="Add Personal Projects" />
                                </CollapsibleContent>
                            </div>
                            <CollapsibleTrigger asChild>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                                >
                                    <ChevronDown
                                        className={`h-4 w-4 transform transition-transform ${
                                            showMoreActions ? "rotate-180" : ""
                                        }`}
                                    />
                                    <span>
                                        {showMoreActions ? "Show less" : "Add more information"}
                                    </span>
                                </button>
                            </CollapsibleTrigger>

                            {/* Desktop button */}
                            <Button className="mt-4 hidden w-full bg-red-500 hover:bg-red-600 xl:inline-flex">
                                Preview &amp; Download CV
                            </Button>
                        </Collapsible>
                    </CardContent>
                </Card>

                {/* Contact info */}
                <Card className="overflow-hidden shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-6">
                            <div className="relative">
                                <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                                    <AvatarImage src="https://github.com/shadcn.png" alt="Nguyen Duc Hieu" />
                                    <AvatarFallback>NDH</AvatarFallback>
                                </Avatar>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white"
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="grow">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h1 className="text-2xl font-bold text-gray-800">
                                        NGUYEN DUC HIEU
                                    </h1>
                                    <span className="text-sm text-gray-500 font-medium">Hiếu</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-4 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>hieundhe150417@fpt.edu.vn</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>0383139556</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>06/11/2025</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                        <span>Male</span>
                                    </div>
                                    <div className="flex items-center gap-2 sm:col-span-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>ct12a Kim Văn Kim Lũ, ...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Mobile Preview button */}
                <Card className="shadow-sm xl:hidden">
                    <CardContent className="p-4">
                        <Button className="w-full bg-red-500 hover:bg-red-600">
                            Preview &amp; Download CV
                        </Button>
                    </CardContent>
                </Card>

                {/* About Me Section */}
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-50 rounded-full p-3"><UserCircle2 className="w-6 h-6 text-red-400" /></div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">About Me</h3>
                                    <p className="text-sm text-gray-500">Introduce your strengths and years of experience</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => console.log("Add About Me")} className="text-red-400 hover:text-red-500">
                                <Plus className="w-6 h-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Education Section */}
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-50 rounded-full p-3"><GraduationCap className="w-6 h-6 text-red-400" /></div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Education</h3>
                                    <p className="text-sm text-gray-500">Share your background education</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => console.log("Add Education")} className="text-red-400 hover:text-red-500">
                                <Plus className="w-6 h-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Work Experience Section */}
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-50 rounded-full p-3"><Briefcase className="w-6 h-6 text-red-400" /></div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Work Experience</h3>
                                    <p className="text-sm text-gray-500">Highlight detailed information about your job history</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => console.log("Add Work Experience")} className="text-red-400 hover:text-red-500">
                                <Plus className="w-6 h-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Skills Section */}
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-50 rounded-full p-3"><Wrench className="w-6 h-6 text-red-400" /></div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Skills</h3>
                                    <p className="text-sm text-gray-500">Showcase your skills and proficiencies</p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <PlusCircle className="w-6 h-6" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Thêm nhóm kỹ năng</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => console.log("Add core skills")}>
                                        Core skills
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => console.log("Add soft skills")}>
                                        Soft skills
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardContent>
                </Card>

                {/* Foreign Language Section */}
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-50 rounded-full p-3"><Languages className="w-6 h-6 text-red-400" /></div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Foreign Language</h3>
                                    <p className="text-sm text-gray-500">Provide your language skills and proficiencies</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => console.log("Add Foreign Language")} className="text-red-400 hover:text-red-500">
                                <Plus className="w-6 h-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Highlight Project Section */}
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-50 rounded-full p-3"><Projector className="w-6 h-6 text-red-400" /></div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Highlight Project</h3>
                                    <p className="text-sm text-gray-500">Showcase your highlight project</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => console.log("Add Highlight Project")} className="text-red-400 hover:text-red-500">
                                <Plus className="w-6 h-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Certificates Section */}
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-50 rounded-full p-3"><BadgeCheck className="w-6 h-6 text-red-400" /></div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Certificates</h3>
                                    <p className="text-sm text-gray-500">Provides evidence of your specific expertise and skills</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => console.log("Add Certificates")} className="text-red-400 hover:text-red-500">
                                <Plus className="w-6 h-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Awards Section */}
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-50 rounded-full p-3"><Award className="w-6 h-6 text-red-400" /></div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Awards</h3>
                                    <p className="text-sm text-gray-500">Highlight your awards or recognitions</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => console.log("Add Awards")} className="text-red-400 hover:text-red-500">
                                <Plus className="w-6 h-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

type ProfileActionRowProps = {
    label: string;
};

const ProfileActionRow = ({ label }: ProfileActionRowProps) => {
    return (
        <button
            type="button"
            className="flex w-full items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            onClick={() => console.log(label)}
        >
            <PlusCircle className="h-4 w-4 text-red-500" />
            <span className="truncate">{label}</span>
        </button>
    );
};

export default ProfileCvPage;
