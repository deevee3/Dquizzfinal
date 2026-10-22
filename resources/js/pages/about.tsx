import MarketingLayout from '@/layouts/marketing-layout';
import { Head } from '@inertiajs/react';
import { Users, Target, Heart, Award } from 'lucide-react';

export default function About() {
    return (
        <MarketingLayout>
            <Head title="About - D'Quizz" />
            
            <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E97451]/30 bg-[#FCEEEA] text-[#E97451] text-xs font-bold mb-6 uppercase tracking-wider shadow-sm">
                            About Us
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-slate-900">We're on a mission to<br />revolutionize lead gen.</h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            We believe that marketing shouldn't just be about capturing emails—it should be about providing value, understanding your audience, and building relationships.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                        <ValueCard 
                            icon={<Users />}
                            title="Customer First"
                            description="We prioritize our customers' success above all else."
                        />
                        <ValueCard 
                            icon={<Target />}
                            title="Impact Focused"
                            description="We measure our success by the results we drive."
                        />
                        <ValueCard 
                            icon={<Heart />}
                            title="Empathy"
                            description="We build tools that help you understand your audience."
                        />
                        <ValueCard 
                            icon={<Award />}
                            title="Excellence"
                            description="We strive for the highest quality in everything we do."
                        />
                    </div>

                    <div className="rounded-[2.5rem] bg-white border border-slate-100 p-8 lg:p-12 overflow-hidden relative shadow-xl shadow-slate-200/50">
                        <div className="absolute top-0 right-0 p-12 opacity-50">
                            <div className="w-64 h-64 bg-[#FCEEEA] rounded-full blur-3xl" />
                        </div>
                        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold mb-6 text-slate-900">Our Story</h2>
                                <div className="space-y-4 text-slate-500 text-lg leading-relaxed">
                                    <p>
                                        Founded in 2024, D'Quizz started with a simple observation: traditional lead magnets were losing their effectiveness. PDFs and checklists were gathering digital dust, and marketers were struggling to engage their audience.
                                    </p>
                                    <p>
                                        We realized that people love to learn about themselves. They want personalized feedback, not generic advice. That's why we built a platform that makes it easy to create interactive assessments and scorecards.
                                    </p>
                                    <p>
                                        Today, we help thousands of businesses transform their lead generation strategy, turning passive visitors into engaged prospects through the power of quiz funnels.
                                    </p>
                                </div>
                            </div>
                            <div className="h-full min-h-[400px] rounded-3xl bg-gradient-to-br from-[#FCEEEA] to-[#E97451]/10 border border-[#E97451]/10 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-80 mix-blend-multiply" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}

function ValueCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-[#E97451]/30 hover:shadow-lg transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FCEEEA] flex items-center justify-center text-[#E97451] mb-6 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{description}</p>
        </div>
    );
}
