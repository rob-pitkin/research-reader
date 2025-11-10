"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/hooks/use-chat";
import { Bot, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { toast } from "sonner";

import type { TextContent } from "pdfjs-dist/types/src/display/api";

// PDF.js worker from CDN
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

interface PDFViewerProps {
    url: string;
    onPageChange?: (page: number) => void;
    onTextExtracted?: (text: string) => void;
}

export function PDFViewer({ url, onPageChange, onTextExtracted }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageText, setPageText] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const pdfContainerRef = useRef<HTMLDivElement>(null);
    const [selectedText, setSelectedText] = useState<string>("");
    const [selectionPosition, setSelectionPosition] = useState<{
        top: number;
        left: number;
    } | null>(null);
    const [userQuestion, setUserQuestion] = useState<string>("");
    const [scale, setScale] = useState<number>(1);
    const [askAiQuestion, setAskAiQuestion] = useState<string>("");

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        if (onPageChange) {
            onPageChange(1);
        }
    }

    function onDocumentLoadError(error: Error) {
        console.error("Error loading PDF:", error);
        setError(`Failed to load PDF: ${error.message}`);
    }

    const onPageText = (text: TextContent) => {
        const textItems = text.items.filter((item) => "str" in item) as { str: string }[];
        setPageText(textItems.map((item) => item.str).join(" "));
    };

    useEffect(() => {
        if (pageText && onTextExtracted) {
            onTextExtracted(pageText);
        }
    }, [pageText, onTextExtracted]);

    const { addMessage } = useChatStore();

    const handleMouseUp = useCallback(() => {
        const selection = window.getSelection();

        const text = selection?.toString() || "";

        if (text.trim()) {
            const range = selection?.getRangeAt(0);

            if (range) {
                const rect = range.getBoundingClientRect();

                const containerRect = pdfContainerRef.current?.getBoundingClientRect();

                if (containerRect) {
                    setSelectionPosition({
                        top: rect.top - containerRect.top,

                        left: rect.right - containerRect.left + 10,
                    });

                    setSelectedText(text);
                }
            }
        } else {
            // Only clear selection if the user clicks outside of the pop-up

            const popup = document.getElementById("ask-ai-popup");

            if (popup && !popup.contains(document.activeElement)) {
                setSelectedText("");

                setSelectionPosition(null);

                setUserQuestion("");
            }
        }
    }, []);

    const handleAskAi = async () => {
        if (!selectedText && !askAiQuestion) return;

        const question = userQuestion || askAiQuestion;

        addMessage({
            id: Date.now().toString(),

            text: question,

            isUser: true,
        });

        try {
            const response = await fetch("/api/ai/ask", {
                method: "POST",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({
                    text: selectedText || pageText,

                    context: pageText,

                    question,

                    url,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();

                throw new Error(errorData.error || "Failed to get response from AI");
            }

            const data = await response.json();

            addMessage({
                id: `${Date.now()}-ai`,

                text: data.explanation,

                isUser: false,
            });
        } catch (error) {
            addMessage({
                id: `${Date.now()}-ai-error`,

                text:
                    error instanceof Error ? error.message : "An error occurred. Please try again.",

                isUser: false,
            });
        } finally {
            setSelectedText("");

            setSelectionPosition(null);

            setUserQuestion("");

            setAskAiQuestion("");
        }
    };

    const changePage = (offset: number) => {
        setPageNumber((prevPageNumber) => {
            const newPageNumber = prevPageNumber + offset;

            return Math.min(Math.max(1, newPageNumber), numPages || 1);
        });
    };

    const previousPage = () => changePage(-1);

    const nextPage = () => changePage(1);

    const handleZoom = (value: number[]) => {
        setScale(value[0]);
    };

    return (
        <Card className="w-full h-full flex flex-col">
            <div className="flex flex-wrap items-center justify-between p-4 border-b gap-2">
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
                        max={numPages || 1}
                        value={pageNumber}
                        onChange={(e) => setPageNumber(Number(e.target.value))}
                        className="w-20 text-center"
                    />

                    <span className="text-sm text-muted-foreground">of {numPages || "-"}</span>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={nextPage}
                        disabled={pageNumber >= (numPages || 1)}
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

            <div
                className="flex-1 overflow-auto p-4 relative"
                ref={pdfContainerRef}
                onMouseUp={handleMouseUp}
            >
                {selectedText && selectionPosition && (
                    <div
                        id="ask-ai-popup"
                        className="absolute z-10 flex flex-col gap-2 p-2 bg-card border rounded-lg shadow-lg w-64"
                        style={{ top: selectionPosition.top, left: selectionPosition.left }}
                    >
                        <p className="text-xs text-muted-foreground p-2 border-b">
                            Selected: "{selectedText.substring(0, 50)}..."
                        </p>

                        <Input
                            placeholder="Ask a question about the text..."
                            value={userQuestion}
                            onChange={(e) => setUserQuestion(e.target.value)}
                            className="w-full"
                        />

                        <Button size="sm" className="w-full gap-2" onClick={handleAskAi}>
                            <Bot className="h-4 w-4" /> Ask AI
                        </Button>
                    </div>
                )}

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
                        onGetTextSuccess={onPageText}
                    />
                </Document>
            </div>
        </Card>
    );
}
