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
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Paper[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Handle URL search params and auto-execute search
    useEffect(() => {
        const query = searchParams.get("q");
        if (query) {
            setSearchQuery(query);
            // Auto-execute search with the URL parameter
            executeSearch(query);
        }
    }, [searchParams]);

    const executeSearch = async (query: string) => {
        if (!query.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/arxiv/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Error searching papers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (searchQuery.trim()) {
            // Update URL to reflect the search query
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
        executeSearch(searchQuery);
    };

    const handleViewPDF = (pdfUrl: string, title: string) => {
        router.push(`/viewer?url=${encodeURIComponent(pdfUrl)}&title=${encodeURIComponent(title)}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
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
                                    <BreadcrumbPage>Research Papers</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search for research papers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                            className="flex-1"
                        />
                        <Button onClick={handleSearch} disabled={isLoading}>
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                    </div>

                    {/* Search Results */}
                    <div className="grid gap-4">
                        {searchResults.map((paper) => (
                            <Card key={paper.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{paper.title}</CardTitle>
                                    <CardDescription>
                                        {paper.authors.join(", ")} • {formatDate(paper.published)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {paper.summary}
                                    </p>
                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const pdfLink = paper.links.find(
                                                    (link) => link.type === "application/pdf",
                                                );
                                                if (pdfLink) {
                                                    handleViewPDF(pdfLink.href, paper.title);
                                                }
                                            }}
                                        >
                                            View PDF
                                        </Button>
                                        <Button variant="outline" size="sm" asChild>
                                            <a
                                                href={
                                                    paper.links.find(
                                                        (link) => link.type === "text/html",
                                                    )?.href ?? ""
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                View on ArXiv
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
