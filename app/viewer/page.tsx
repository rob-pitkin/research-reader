"use client";

import { PDFViewer } from "@/components/PDFViewer";
import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PDFViewerComponent() {
    const searchParams = useSearchParams();
    const pdfUrl = searchParams.get("url"); // This is the original, encoded paper URL
    const title = searchParams.get("title") || "PDF Viewer";

    // We now pass the proxied URL to the viewer component
    const viewerUrl = pdfUrl ? `/api/proxy?url=${pdfUrl}` : null;

    if (!viewerUrl) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No PDF URL provided</p>
            </div>
        );
    }

    return (
        <>
            <PageHeader
                breadcrumb={[
                    { label: "Research Papers", href: "/search" },
                    { label: title },
                ]}
            />
            <div className="flex-1 p-4">
                <PDFViewer url={viewerUrl} />
            </div>
        </>
    );
}

export default function PDFViewerPage() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Suspense fallback={<div className="flex items-center justify-center h-full">Loading PDF...</div>}>
                    <PDFViewerComponent />
                </Suspense>
            </SidebarInset>
        </SidebarProvider>
    );
}