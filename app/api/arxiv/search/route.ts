import arxiv from "arxiv-api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

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
            start: 0,
            maxResults: 10,
        });

        return NextResponse.json(papers);
    } catch (error) {
        console.error("Error searching ArXiv:", error);
        return NextResponse.json({ error: "Failed to search ArXiv" }, { status: 500 });
    }
}
