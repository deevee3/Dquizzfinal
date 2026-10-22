import { AppShell } from '@/components/app-shell';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function Success() {
    return (
        <AppShell>
            <Head title="Subscription Successful" />

            <div className="flex min-h-screen flex-col items-center justify-center px-4">
                <div className="text-center">
                    <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>

                    <h1 className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">Welcome aboard!</h1>
                    <p className="mb-8 text-slate-600 dark:text-slate-400">
                        Your subscription is now active. You have full access to all features.
                    </p>

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-xl bg-[#E97451] px-6 py-3 font-bold text-white shadow-lg shadow-[#E97451]/25 transition-all hover:bg-[#C75B32]"
                    >
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </AppShell>
    );
}
