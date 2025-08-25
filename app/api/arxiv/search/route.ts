import arxiv from "arxiv-api";
import { NextResponse } from "next/server";

type SortBy = "relevance" | "lastUpdatedDate" | "submittedDate";
type SortOrder = "ascending" | "descending";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const author = searchParams.get("author");
    const sortBy = (searchParams.get("sortBy") as SortBy) || "submittedDate";
    const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "descending";
    const maxResults = Number.parseInt(searchParams.get("maxResults") || "10", 10);
    const start = Number.parseInt(searchParams.get("start") || "0", 10);

    if (!query && !author) {
        return NextResponse.json(
            { error: "At least one of 'q' or 'author' query parameter is required" },
            { status: 400 },
        );
    }

    const includeParams = [];
    if (query) {
        includeParams.push({ name: query });
    }
    if (author) {
        includeParams.push({ name: author, prefix: "au" });
    }

    try {
        const papers = await arxiv.search({
            searchQueryParams: [
                {
                    include: includeParams,
                },
            ],
            sortBy,
            sortOrder,
            start,
            maxResults,
        });

        return NextResponse.json(papers);
    } catch (error) {
        console.error("Error searching papers:", error);
        return NextResponse.json({ error: "Failed to search papers" }, { status: 500 });
    }
}
