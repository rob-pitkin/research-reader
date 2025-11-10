"use client";

import { NavUser } from "@/components/nav-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { useChatStore } from "@/hooks/use-chat";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Bot } from "lucide-react";
import { useEffect, useState } from "react";

export function ChatSidebar() {
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const { messages, addMessage } = useChatStore();
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
        };

        fetchUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            addMessage({
                id: Date.now().toString(),
                text: newMessage,
                isUser: true,
            });
            setNewMessage("");
        }
    };

    return (
        <Sidebar className="w-80 flex flex-col">
            <SidebarHeader>
                <h2 className="text-lg font-semibold">Chat</h2>
            </SidebarHeader>
            <SidebarContent className="flex-grow overflow-y-auto">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Chat History</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto space-y-4 p-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${
                                    message.isUser ? "justify-end" : "justify-start"
                                }`}
                            >
                                <div
                                    className={`p-2 rounded-lg ${
                                        message.isUser
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    }`}
                                >
                                    {message.text}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="p-4 border-t">
                        <div className="flex items-center gap-2">
                            <Textarea
                                placeholder="Ask a question..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="w-full"
                            />
                            <Button
                                size="sm"
                                className="gap-2"
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                            >
                                <Bot className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </SidebarContent>
            <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
        </Sidebar>
    );
}
