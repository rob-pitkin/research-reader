"use client";

import { HTMLViewer } from "@/components/HTMLViewer";
import { PDFViewer } from "@/components/PDFViewer";
import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
        <>
            <PageHeader
                breadcrumb={[{ label: "Research Papers", href: "/search" }, { label: title }]}
            />
            <div className="flex-1 p-4">
                {type === "html" ? <HTMLViewer url={viewerUrl} /> : <PDFViewer url={viewerUrl} />}
            </div>
        </>
    );
}

export default function ViewerPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Suspense
                    fallback={
                        <div className="flex items-center justify-center h-full">
                            Loading paper...
                        </div>
                    }
                >
                    <ViewerComponent />
                </Suspense>
            </SidebarInset>
        </SidebarProvider>
    );
}
