"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFViewerProps {
    url: string;
}

export function PDFViewer({ url }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);

    console.log("url", url);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const changePage = (offset: number) => {
        setPageNumber((prevPageNumber) => {
            const newPageNumber = prevPageNumber + offset;
            return Math.min(Math.max(1, newPageNumber), numPages);
        });
    };

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    const handleZoom = (value: number[]) => {
        setScale(value[0]);
    };

    return (
        <Card className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={previousPage}
                        disabled={pageNumber <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Input
                        type="number"
                        min={1}
                        max={numPages}
                        value={pageNumber}
                        onChange={(e) => setPageNumber(Number(e.target.value))}
                        className="w-20 text-center"
                    />
                    <span className="text-sm text-muted-foreground">of {numPages}</span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={nextPage}
                        disabled={pageNumber >= numPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <ZoomOut className="h-4 w-4 text-muted-foreground" />
                    <Slider
                        defaultValue={[1]}
                        min={0.5}
                        max={2}
                        step={0.1}
                        value={[scale]}
                        onValueChange={handleZoom}
                        className="w-32"
                    />
                    <ZoomIn className="h-4 w-4 text-muted-foreground" />
                </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
                <Document
                    file={url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="flex justify-center"
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        className="shadow-lg"
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                    />
                </Document>
            </div>
        </Card>
    );
}
