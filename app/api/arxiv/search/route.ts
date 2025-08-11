import arxiv from "arxiv-api";
import { NextResponse } from "next/server";

type SortBy = "relevance" | "lastUpdatedDate" | "submittedDate";
type SortOrder = "ascending" | "descending";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const sortBy = (searchParams.get("sortBy") as SortBy) || "submittedDate";
    const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "descending";
    const maxResults = Number.parseInt(searchParams.get("maxResults") || "10", 10);
    const start = Number.parseInt(searchParams.get("start") || "0", 10);

    if (!query) {
        return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    try {
        const papers = await arxiv.search({
            searchQueryParams: [
                {
                    include: [{ name: query }],
                },
            ],
            sortBy,
            sortOrder,
            start,
            maxResults,
        });

        return NextResponse.json(papers);
    } catch (error) {
        console.error("Error searching ArXiv:", error);
        return NextResponse.json({ error: "Failed to search ArXiv" }, { status: 500 });
    }
}
