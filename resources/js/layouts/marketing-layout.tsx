import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Globe2, ShieldCheck, Zap } from 'lucide-react';
import { PropsWithChildren } from 'react';

export default function MarketingLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen bg-[#FFF9F5] text-slate-900 selection:bg-[#F48D5C]/30 overflow-x-hidden font-sans">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-[#FFE4D6] rounded-full blur-[120px] opacity-60 mix-blend-multiply" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-[#FFF0E0] rounded-full blur-[120px] opacity-60 mix-blend-multiply" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFF9F5]/80 backdrop-blur-md border-b border-[#F48D5C]/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#F48D5C] flex items-center justify-center shadow-lg shadow-[#F48D5C]/20">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">D'Quizz</span>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <Link href="/" className="hover:text-[#F48D5C] transition-colors">Home</Link>
                        <Link href="/about" className="hover:text-[#F48D5C] transition-colors">About</Link>
                        <Link href="/pricing" className="hover:text-[#F48D5C] transition-colors">Pricing</Link>
                        <Link href="/contact" className="hover:text-[#F48D5C] transition-colors">Contact</Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link href={dashboard.url()}>
                                <Button className="bg-[#FFE4D6] text-[#F48D5C] hover:bg-[#F48D5C] hover:text-white border-none shadow-none font-semibold transition-all">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href={login.url()}>
                                    <Button className="bg-[#FFE4D6] text-[#F48D5C] hover:bg-[#F48D5C] hover:text-white border-none shadow-none font-semibold transition-all">
                                        Dashboard
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 pt-20">
                {children}
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-[#F48D5C]/10 bg-white/50 backdrop-blur-xl py-12 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-[#F48D5C] flex items-center justify-center">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">D'Quizz</span>
                        </div>
                        <p className="text-slate-500 max-w-sm">
                            Transforming passive visitors into engaged prospects through the power of quiz funnels.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-slate-900">Company</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li><Link href="/about" className="hover:text-[#F48D5C] transition-colors">About Us</Link></li>
                            <li><Link href="/pricing" className="hover:text-[#F48D5C] transition-colors">Pricing</Link></li>
                            <li><Link href="/contact" className="hover:text-[#F48D5C] transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-slate-900">Legal</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li><a href="#" className="hover:text-[#F48D5C] transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-[#F48D5C] transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#F48D5C]/10 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} D'Quizz. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Globe2 className="w-5 h-5 cursor-pointer hover:text-[#F48D5C] transition-colors" />
                        <ShieldCheck className="w-5 h-5 cursor-pointer hover:text-[#F48D5C] transition-colors" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
