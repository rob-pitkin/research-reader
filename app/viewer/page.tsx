"use client";

import { PDFViewer } from "@/components/PDFViewer";
import { AppSidebar } from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PDFViewerComponent() {
    const searchParams = useSearchParams();
    const pdfUrl = searchParams.get("url");
    const title = searchParams.get("title") || "PDF Viewer";

    if (!pdfUrl) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No PDF URL provided</p>
            </div>
        );
    }

    return (
        <>
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
                                <BreadcrumbLink href="/search">
                                    Research Papers
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div className="flex-1 p-4">
                <PDFViewer url={pdfUrl} />
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