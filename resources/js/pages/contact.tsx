import { Button } from '@/components/ui/button';
import MarketingLayout from '@/layouts/marketing-layout';
import { Head } from '@inertiajs/react';
import { Mail, MessageSquare } from 'lucide-react';

export default function Contact() {
    return (
        <MarketingLayout>
            <Head title="Contact - D'Quizz" />
            
            <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E97451]/30 bg-[#FCEEEA] text-[#E97451] text-xs font-bold mb-6 uppercase tracking-wider shadow-sm">
                            Contact Us
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-slate-900">Get in touch</h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Have questions? We'd love to hear from you.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* Contact Info */}
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold text-slate-900">Talk to a human</h2>
                            <p className="text-slate-500 text-lg">
                                Questions about your account or the product? Email is the fastest way to reach us.
                            </p>

                            <div className="space-y-6">
                                <ContactItem
                                    icon={<Mail />}
                                    title="Email support"
                                    description="Get help with your account"
                                    action="support@dquizz.com"
                                />
                                <ContactItem
                                    icon={<MessageSquare />}
                                    title="Product feedback"
                                    description="Tell us what would make D'Quizz work better for you"
                                    action="support@dquizz.com"
                                />
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="rounded-[2.5rem] bg-white border border-slate-100 p-8 lg:p-10 shadow-xl shadow-slate-200/50">
                            <form className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="first-name" className="text-sm font-bold text-slate-700">First name</label>
                                        <input type="text" id="first-name" className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 focus:border-[#E97451] focus:ring-1 focus:ring-[#E97451] outline-none transition-all placeholder:text-slate-400" placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="last-name" className="text-sm font-bold text-slate-700">Last name</label>
                                        <input type="text" id="last-name" className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 focus:border-[#E97451] focus:ring-1 focus:ring-[#E97451] outline-none transition-all placeholder:text-slate-400" placeholder="Doe" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-bold text-slate-700">Email</label>
                                    <input type="email" id="email" className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 focus:border-[#E97451] focus:ring-1 focus:ring-[#E97451] outline-none transition-all placeholder:text-slate-400" placeholder="john@example.com" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-bold text-slate-700">Message</label>
                                    <textarea id="message" rows={4} className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-slate-900 focus:border-[#E97451] focus:ring-1 focus:ring-[#E97451] outline-none transition-all placeholder:text-slate-400" placeholder="How can we help you?" />
                                </div>
                                <Button className="w-full bg-[#E97451] hover:bg-[#C75B32] text-white py-6 text-lg font-bold rounded-xl shadow-lg shadow-[#E97451]/25">
                                    Send Message
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}

function ContactItem({ icon, title, description, action }: { icon: React.ReactNode, title: string, description: string, action: string }) {
    return (
        <div className="flex gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-[#FCEEEA] flex items-center justify-center text-[#E97451] shrink-0 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-500 mb-2">{description}</p>
                <div className="font-semibold text-[#E97451] hover:text-[#C75B32] cursor-pointer transition-colors">
                    {action}
                </div>
            </div>
        </div>
    );
}
