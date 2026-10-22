import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans transition-colors duration-300">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#ED9665]/20 rounded-full blur-[100px] animate-pulse mix-blend-screen" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#E8A15C]/20 rounded-full blur-[100px] animate-pulse mix-blend-screen" style={{ animationDelay: '2s' }} />
                <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-[#E76F51]/10 rounded-full blur-[80px] mix-blend-screen" />
            </div>

            <div className="relative z-10">
                {variant === 'header' ? (
                    <div className="flex min-h-screen w-full flex-col">{children}</div>
                ) : (
                    <SidebarProvider defaultOpen={isOpen}>{children}</SidebarProvider>
                )}
            </div>
        </div>
    );
}
