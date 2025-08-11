import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('URL parameter is required', { status: 400 });
  }

  try {
    // Fetch the PDF from the provided URL
    const response = await fetch(url);

    if (!response.ok) {
      return new NextResponse(`Failed to fetch PDF: ${response.statusText}`, { status: response.status });
    }

    // Get the PDF content as an ArrayBuffer
    const pdfBuffer = await response.arrayBuffer();

    // Return the PDF content with the correct content type
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="paper.pdf"',
      },
    });
  } catch (error) {
    console.error('Error proxying PDF:', error);
    return new NextResponse('Failed to proxy PDF', { status: 500 });
  }
}
