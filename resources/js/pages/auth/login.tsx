import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { Globe, Zap } from 'lucide-react';

export default function Login() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FDF8F4] px-6 text-slate-900">
            <Head title="Sign In - D'Quizz" />

            {/* Background Gradients */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-[#F9DCD3] opacity-60 blur-[120px] mix-blend-multiply" />
                <div className="absolute right-[-10%] bottom-[-20%] h-[800px] w-[800px] rounded-full bg-[#F9DCD3] opacity-60 blur-[120px] mix-blend-multiply" />
            </div>

            <div className="relative z-10 w-full max-w-md rounded-2xl border border-[#E97451]/20 bg-white/90 p-8 shadow-xl backdrop-blur-xl">
                <div className="mb-8 flex flex-col items-center text-center">
                    <Link href="/" className="mb-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E97451] shadow-lg shadow-[#E97451]/20">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">D'Quizz</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
                    <p className="mt-1 text-sm text-slate-500">Sign in with WorkOS to manage your interactive quizzes and funnels</p>
                </div>

                <a href="/login/workos" className="block">
                    <Button type="button" className="h-11 w-full bg-[#E97451] font-semibold text-white hover:bg-[#C75B32]">
                        <Globe className="mr-2 h-4 w-4" />
                        Continue with WorkOS (Google / SSO)
                    </Button>
                </a>
            </div>
        </div>
    );
}
