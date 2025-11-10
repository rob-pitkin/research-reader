"use client";

import { HTMLViewer } from "@/components/HTMLViewer";
import { PDFViewer } from "@/components/PDFViewer";
import { ChatSidebar } from "@/components/chat-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ViewerComponent() {
    const searchParams = useSearchParams();
    const paperUrl = searchParams.get("url");
    const title = searchParams.get("title") || "Paper Viewer";
    const type = searchParams.get("type") || "pdf"; // Default to pdf

    const viewerUrl = paperUrl ? `/api/proxy?url=${paperUrl}` : null;

    if (!viewerUrl) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No paper URL provided</p>
            </div>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen">
                <main className="flex-1 overflow-auto">
                    {type === "html" ? (
                        <HTMLViewer url={viewerUrl} />
                    ) : (
                        <PDFViewer url={viewerUrl} />
                    )}
                </main>
                <ChatSidebar />
            </div>
        </SidebarProvider>
    );
}

export default function ViewerPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-full">Loading paper...</div>
            }
        >
            <ViewerComponent />
        </Suspense>
    );
}
