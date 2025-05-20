declare module "arxiv-api" {
    interface SearchParams {
        searchQueryParams: Array<{
            include?: Array<{ name: string; prefix?: string }>;
            exclude?: Array<{ name: string; prefix?: string }>;
        }>;
        start?: number;
        maxResults?: number;
        sortBy?: "relevance" | "lastUpdatedDate" | "submittedDate";
        sortOrder?: "ascending" | "descending";
    }

    interface Paper {
        id: string;
        title: string;
        authors: string[];
        summary: string;
        published: string;
        pdf: string;
        url: string;
    }

    function search(params: SearchParams): Promise<Paper[]>;

    export default {
        search,
    };
}
