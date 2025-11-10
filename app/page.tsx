"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Brain, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center space-y-4 mb-16">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                        Research Reader
                    </h1>
                    <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                        Your AI-powered research companion. Save, read, and understand research
                        papers with ease.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button
                            size="lg"
                            className="gap-2"
                            onClick={() => router.push("/dashboard")}
                        >
                            Get Started <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline">
                            Learn More
                        </Button>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <BookOpen className="h-8 w-8 mb-2 text-primary" />
                            <CardTitle>Smart Reading</CardTitle>
                            <CardDescription>
                                Upload and organize your research papers in one place
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Keep all your research papers organized and easily accessible with
                                our intuitive interface.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Brain className="h-8 w-8 mb-2 text-primary" />
                            <CardTitle>AI Assistance</CardTitle>
                            <CardDescription>
                                Get instant insights and summaries from your papers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Our AI helps you understand complex concepts and extract key
                                information from your papers.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Upload className="h-8 w-8 mb-2 text-primary" />
                            <CardTitle>Paper Search</CardTitle>
                            <CardDescription>
                                Access and import papers directly from academic sources
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Seamlessly browse and import papers using our API integration. Stay
                                up to date with the latest research in your field.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
