"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    TrendingUp,
    Clock,
    BookOpen,
    Users,
    Calendar,
    FileText,
    ExternalLink,
    Star,
    Eye,
    Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Paper {
    id: string;
    title: string;
    authors: string[];
    categories: string[];
    summary: string;
    published: string;
    links: { type: string; href: string }[];
}

interface QuickStat {
    title: string;
    value: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
    const [trendingPapers, setTrendingPapers] = useState<Paper[]>([]);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);
    const [isLoadingTrending, setIsLoadingTrending] = useState(true);

    const quickStats: QuickStat[] = [
        {
            title: "Papers Read",
            value: "24",
            description: "This month",
            icon: BookOpen,
            trend: "+12%",
        },
        {
            title: "Research Hours",
            value: "48h",
            description: "Time spent reading",
            icon: Clock,
            trend: "+8%",
        },
        {
            title: "Saved Papers",
            value: "156",
            description: "In your library",
            icon: Star,
        },
        {
            title: "Collections",
            value: "8",
            description: "Organized topics",
            icon: Users,
        },
    ];

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        } else {
            router.push("/search");
        }
    };

    const handleViewPDF = (pdfUrl: string, title: string) => {
        router.push(`/viewer?url=${encodeURIComponent(pdfUrl)}&title=${encodeURIComponent(title)}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return "1 day ago";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-6 pt-4">
                    {/* Welcome Section */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
                        <p className="text-muted-foreground">
                            Here's your research overview and latest discoveries
                        </p>
                    </div>

                    {/* Quick Search */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Quick Search
                            </CardTitle>
                            <CardDescription>
                                Search for research papers across ArXiv
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="What are you researching today?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                    className="flex-1"
                                />
                                <Button onClick={handleSearch}>
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {quickStats.map((stat) => (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {stat.title}
                                    </CardTitle>
                                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">
                                            {stat.description}
                                        </p>
                                        {stat.trend && (
                                            <span className="text-xs text-green-600 font-medium">
                                                {stat.trend}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Common tasks to help with your research
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                                    <a href="/search">
                                        <Search className="h-6 w-6" />
                                        <span className="text-sm">Search Papers</span>
                                    </a>
                                </Button>
                                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                                    <a href="/papers">
                                        <BookOpen className="h-6 w-6" />
                                        <span className="text-sm">My Library</span>
                                    </a>
                                </Button>
                                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                                    <a href="/collections">
                                        <Users className="h-6 w-6" />
                                        <span className="text-sm">Collections</span>
                                    </a>
                                </Button>
                                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                                    <a href="/settings">
                                        <Download className="h-6 w-6" />
                                        <span className="text-sm">Export Data</span>
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
