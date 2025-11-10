"use client";

import { AddToCollection } from "@/components/add-to-collection";
import { StarButton } from "@/components/star-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useStarredPapers } from "@/hooks/use-starred-papers";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface Paper {
    id: string;
    title: string;
    authors: string[];
    categories: string[];
    summary: string;
    published: string;
    links: { type: string; href: string }[];
    htmlUrl?: string;
}

function SearchComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [authorQuery, setAuthorQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Paper[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState("submittedDate");
    const [sortOrder, setSortOrder] = useState("descending");
    const [maxResults, setMaxResults] = useState("10");
    const [page, setPage] = useState(1);
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
        };
        fetchUser();
    }, [supabase]);

    const { starredPaperIds, addStar, removeStar } = useStarredPapers(user);

    useEffect(() => {
        const query = searchParams.get("q");
        const author = searchParams.get("author");
        const sortByParam = searchParams.get("sortBy") || "submittedDate";
        const sortOrderParam = searchParams.get("sortOrder") || "descending";
        const maxResultsParam = searchParams.get("maxResults") || "10";
        const pageParam = Number.parseInt(searchParams.get("page") || "1", 10);

        setSortBy(sortByParam);
        setSortOrder(sortOrderParam);
        setMaxResults(maxResultsParam);
        setPage(pageParam);
        setSearchQuery(query || "");
        setAuthorQuery(author || "");

        if (query || author) {
            executeSearch(query, author, sortByParam, sortOrderParam, maxResultsParam, pageParam);
        }
    }, [searchParams]);

    const executeSearch = async (
        query: string | null,
        author: string | null,
        sortBy: string,
        sortOrder: string,
        maxResults: string,
        page: number,
    ) => {
        if (!query?.trim() && !author?.trim()) return;

        setIsLoading(true);
        try {
            const start = (page - 1) * Number.parseInt(maxResults, 10);
            const params = new URLSearchParams({
                sortBy,
                sortOrder,
                maxResults,
                start: start.toString(),
            });
            if (query) {
                params.set("q", query);
            }
            if (author) {
                params.set("author", author);
            }

            const response = await fetch(`/api/arxiv/search?${params.toString()}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Error searching papers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        if (searchQuery.trim() || authorQuery.trim()) {
            const params = new URLSearchParams({
                sortBy,
                sortOrder,
                maxResults,
                page: "1",
            });
            if (searchQuery.trim()) {
                params.set("q", searchQuery);
            }
            if (authorQuery.trim()) {
                params.set("author", authorQuery);
            }
            router.push(`/search?${params.toString()}`);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage < 1) return;
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/search?${params.toString()}`);
    };

    const handleViewPaper = (paperUrl: string, title: string, type: "pdf" | "html") => {
        router.push(
            `/viewer?url=${encodeURIComponent(paperUrl)}&title=${encodeURIComponent(
                title,
            )}&type=${type}`,
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Search Papers</h1>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            placeholder="Search all fields..."
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
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="author">Author</Label>
                            <Input
                                id="author"
                                placeholder="e.g., Hinton, LeCun"
                                value={authorQuery}
                                onChange={(e) => setAuthorQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="w-[180px]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="sortBy">Sort by</Label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger id="sortBy" className="w-[150px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="submittedDate">Newest</SelectItem>
                                    <SelectItem value="lastUpdatedDate">Last Updated</SelectItem>
                                    <SelectItem value="relevance">Relevance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="sortOrder">Order</Label>
                            <Select value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger id="sortOrder" className="w-[130px]">
                                    <SelectValue placeholder="Order" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="descending">Descending</SelectItem>
                                    <SelectItem value="ascending">Ascending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="maxResults">Results</Label>
                            <Select value={maxResults} onValueChange={setMaxResults}>
                                <SelectTrigger id="maxResults" className="w-[90px]">
                                    <SelectValue placeholder="Count" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Search Results */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const pdfLink = paper.links.find(
                                                (link) => link.type === "application/pdf",
                                            );
                                            if (pdfLink) {
                                                handleViewPaper(pdfLink.href, paper.title, "pdf");
                                            }
                                        }}
                                    >
                                        View PDF
                                    </Button>
                                    {paper.htmlUrl && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (paper.htmlUrl) {
                                                    handleViewPaper(
                                                        paper.htmlUrl,
                                                        paper.title,
                                                        "html",
                                                    );
                                                }
                                            }}
                                        >
                                            View HTML
                                        </Button>
                                    )}
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
                                            View Original Paper
                                        </a>
                                    </Button>
                                    {user && (
                                        <>
                                            <StarButton
                                                isStarred={starredPaperIds.includes(paper.id)}
                                                onClick={() => {
                                                    if (starredPaperIds.includes(paper.id)) {
                                                        removeStar(paper.id);
                                                    } else {
                                                        addStar(paper);
                                                    }
                                                }}
                                            />
                                            <AddToCollection user={user} paper={paper} />
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {searchResults.length > 0 && (
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page <= 1 || isLoading}
                        >
                            Previous
                        </Button>
                        <span className="text-sm">Page {page}</span>
                        <Button
                            variant="outline"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={
                                searchResults.length < Number.parseInt(maxResults, 10) || isLoading
                            }
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-full">Loading Search...</div>
            }
        >
            <SearchComponent />
        </Suspense>
    );
}
