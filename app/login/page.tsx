"use client";

import { createClient } from "@/lib/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                router.push("/dashboard");
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                router.push("/dashboard");
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, router]);

    return (
        <div className="flex justify-center items-center h-screen">
            <div className="w-full max-w-md p-8">
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={[]}
                    socialLayout="horizontal"
                />
            </div>
        </div>
    );
}