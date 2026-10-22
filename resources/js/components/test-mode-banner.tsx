import { FlaskConical } from 'lucide-react';

export default function TestModeBanner() {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
            <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
                <span className="font-bold">Test mode.</span> Payments aren&rsquo;t connected yet, so nothing on this page can
                charge you — checkout and the payment portal stay off until a Stripe account is connected.
            </p>
        </div>
    );
}
