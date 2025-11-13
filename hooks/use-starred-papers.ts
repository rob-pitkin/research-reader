"use client";

import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

// Assuming Paper interface is defined in a central types file
// For now, defining it here based on search page structure
interface Paper {
    id: string;
    title: string;
    authors: string[];
    summary: string;
    published: string;
    links: { href: string }[];
    htmlUrl?: string;
}

export function useStarredPapers(user: User | null) {
    const supabase = createClient();
    const [starredPaperIds, setStarredPaperIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStarredPapers = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const { data, error } = await supabase
            .from("papers")
            .select("paper_id")
            .eq("user_id", user.id);

        if (data) {
            setStarredPaperIds(data.map((p) => p.paper_id));
        }
        setLoading(false);
    }, [user, supabase]);

    useEffect(() => {
        fetchStarredPapers();
    }, [fetchStarredPapers]);

    const addStar = async (paper: Paper) => {
        if (!user) return;

        setStarredPaperIds((prev) => [...prev, paper.id]);

        const pdfUrl = paper.links.find((link) => link.href?.includes("/pdf/"))?.href || null;
        const htmlUrl = paper.htmlUrl || null;

        const { error } = await supabase.from("papers").insert({
            user_id: user.id,
            paper_id: paper.id,
            title: paper.title,
            summary: paper.summary,
            authors: paper.authors,
            pdf_url: pdfUrl,
            html_url: htmlUrl,
            published_date: paper.published,
        });

        if (error) {
            setStarredPaperIds((prev) => prev.filter((id) => id !== paper.id));
            console.error("Error starring paper:", error.message);
        }
    };

    const removeStar = async (paperId: string) => {
        if (!user) return;

        setStarredPaperIds((prev) => prev.filter((id) => id !== paperId));

        const { error } = await supabase
            .from("papers")
            .delete()
            .eq("user_id", user.id)
            .eq("paper_id", paperId);

        if (error) {
            setStarredPaperIds((prev) => [...prev, paperId]);
            console.error("Error unstarring paper:", error.message);
        }
    };

    return { starredPaperIds, addStar, removeStar, loading };
}
