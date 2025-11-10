"use client";

interface HTMLViewerProps {
    url: string;
}

export function HTMLViewer({ url }: HTMLViewerProps) {
    return (
        <iframe
            src={url}
            className="w-full h-full border-0"
            title="Paper Viewer"
        />
    );
}