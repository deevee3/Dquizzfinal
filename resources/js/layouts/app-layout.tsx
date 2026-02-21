import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { Toaster } from 'sonner';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (flash.success) {
            import('sonner').then(({ toast }) => toast.success(flash.success));
        }
        if (flash.error) {
            import('sonner').then(({ toast }) => toast.error(flash.error));
        }
    }, [flash]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster position="top-right" />
        </AppLayoutTemplate>
    );
};
