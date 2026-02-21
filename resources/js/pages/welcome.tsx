import { login } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import MarketingLayout from '@/layouts/marketing-layout';
import {
    BarChart3,
    Blocks,
    LayoutTemplate,
    LineChart,
    Sparkles,
    Target,
    Users,
    Zap
} from 'lucide-react';

export default function Welcome() {
    return (
        <MarketingLayout>
            <Head title="D'Quizz - Next Gen Quiz Funnels" />
            
            {/* Hero Section */}
            <section className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Hero Content */}
                        <div className="relative z-10 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#F48D5C]/30 bg-[#FFF5EC] text-[#F48D5C] text-xs font-bold mb-8 uppercase tracking-wider shadow-sm">
                                <Sparkles className="w-3 h-3" />
                                <span>AI-Powered Quiz Funnels</span>
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-slate-900">
                                The Next Gen <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F48D5C] to-[#E85D04]">
                                    Lead Generation
                                </span>
                            </h1>
                            <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Create personalized scorecard marketing funnels that capture leads, 
                                qualify prospects, and deliver tailored results. 
                                <span className="text-slate-900 font-semibold"> Build in minutes, launch today.</span>
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12">
                                <Link href={login.url()}>
                                    <Button size="lg" className="h-12 px-8 text-base bg-[#F48D5C] text-white hover:bg-[#E85D04] shadow-lg shadow-[#F48D5C]/25 border-none rounded-xl">
                                        Start Building Free
                                    </Button>
                                </Link>
                                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-slate-200 bg-white/50 hover:bg-white text-slate-700 rounded-xl">
                                    View Demo
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-8 border-t border-slate-200 pt-8 max-w-lg mx-auto lg:mx-0">
                                <div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">3.8k+</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Active Users</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">230+</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Templates</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">$23M+</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Generated</div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Visual - Clean Stack */}
                        <div className="relative z-10 lg:h-[600px] flex items-center justify-center perspective-[1000px]">
                            <div className="relative w-full max-w-md aspect-[4/5] lg:aspect-square transform-style-3d rotate-y-[-12deg] rotate-x-[5deg]">
                                
                                {/* Decor Elements */}
                                <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-[#FFE4D6] rounded-full blur-3xl opacity-60" />
                                <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-64 h-64 bg-[#FFF0E0] rounded-full blur-3xl opacity-60" />

                                {/* Card 1 (Back) */}
                                <div className="absolute inset-0 bg-white rounded-3xl border border-slate-100 transform translate-z-[-40px] translate-y-[-30px] translate-x-[20px] scale-[0.9] shadow-xl shadow-slate-200/50"></div>
                                
                                {/* Card 2 (Middle) */}
                                <div className="absolute inset-0 bg-white rounded-3xl border border-slate-100 transform translate-z-[-20px] translate-y-[-15px] translate-x-[10px] scale-[0.95] shadow-xl shadow-slate-200/50"></div>
                                
                                {/* Card 3 (Front - Main) */}
                                <div className="absolute inset-0 bg-white rounded-3xl border border-slate-100 p-8 shadow-2xl shadow-[#F48D5C]/10 transform translate-z-[0]">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-12 h-12 rounded-2xl bg-[#FFF5EC] flex items-center justify-center">
                                            <Target className="w-6 h-6 text-[#F48D5C]" />
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-[#FFF5EC] text-[#F48D5C] text-xs font-bold border border-[#F48D5C]/20">
                                            +24% Conv.
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="h-2.5 w-24 bg-slate-100 rounded-full" />
                                            <div className="h-10 w-full bg-slate-50 rounded-xl border border-slate-100" />
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <div className="h-2.5 w-32 bg-slate-100 rounded-full" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="h-28 rounded-xl bg-[#FFF5EC] border border-[#F48D5C]/20 p-5 flex flex-col justify-end relative overflow-hidden group cursor-pointer transition-all hover:shadow-md">
                                                    <div className="w-8 h-8 rounded-full bg-[#F48D5C] text-white flex items-center justify-center text-xs font-bold mb-3 shadow-sm">A</div>
                                                    <div className="h-2 w-16 bg-[#F48D5C]/30 rounded-full" />
                                                </div>
                                                <div className="h-28 rounded-xl bg-slate-50 border border-slate-100 p-5 flex flex-col justify-end relative overflow-hidden group cursor-pointer transition-all hover:bg-slate-100">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold mb-3">B</div>
                                                    <div className="h-2 w-16 bg-slate-200 rounded-full" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 mt-6 border-t border-slate-100">
                                            <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
                                                <span className="font-medium">Completion Rate</span>
                                                <span className="text-slate-900 font-bold">84%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full w-[84%] bg-gradient-to-r from-[#F48D5C] to-[#E9C46A]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="relative py-24 px-6 z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 rounded-[2rem] bg-white border border-slate-100 p-10 relative overflow-hidden group hover:border-[#F48D5C]/30 transition-all shadow-sm hover:shadow-md">
                            <div className="absolute top-0 right-0 p-8 opacity-50 group-hover:opacity-100 transition-opacity">
                                <div className="w-48 h-48 bg-[#FFF5EC] rounded-full blur-3xl" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-[#FFF5EC] flex items-center justify-center mb-6">
                                    <LayoutTemplate className="w-7 h-7 text-[#F48D5C]" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-slate-900">Visual Builder</h3>
                                <p className="text-slate-500 max-w-md text-lg leading-relaxed">
                                    Drag-and-drop interface to build complex logic flows without writing a single line of code. 
                                    What you see is what you get.
                                </p>
                            </div>
                        </div>
                        
                        <div className="rounded-[2rem] bg-[#F48D5C] border border-[#E85D04] p-10 relative overflow-hidden group shadow-xl shadow-[#F48D5C]/20">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#F48D5C] to-[#E85D04]" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-sm">
                                    <Zap className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white">Smart Scoring</h3>
                                <p className="text-white/90 text-lg leading-relaxed">
                                    Automatically calculate scores and segment users into different buckets based on their responses.
                                </p>
                            </div>
                        </div>

                        <FeatureCard 
                            icon={<Users />}
                            title="Lead Capture"
                            description="High-converting forms that integrate seamlessly with your favorite CRM and email tools."
                        />
                        <FeatureCard 
                            icon={<BarChart3 />}
                            title="Analytics"
                            description="Deep insights into user behavior, drop-off points, and conversion metrics."
                        />
                        <FeatureCard 
                            icon={<Blocks />}
                            title="Integrations"
                            description="Connect with 50+ tools including Slack, Mailchimp, HubSpot, and more."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 px-6 bg-white/40">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-slate-900">Easily control your <br />quiz & flow.</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                            From simple surveys to complex diagnostic tools, we provide the infrastructure you need.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <StepItem 
                                number="01" 
                                title="Design your questions"
                                description="Choose from multiple question types including multiple choice, slider, and text input."
                                active
                            />
                            <StepItem 
                                number="02" 
                                title="Set scoring logic"
                                description="Assign points and values to answers to determine the final outcome."
                            />
                            <StepItem 
                                number="03" 
                                title="Customize results"
                                description="Create personalized result pages that speak directly to the user's situation."
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#FFF5EC] blur-3xl rounded-full opacity-60" />
                            <div className="relative bg-white border border-slate-100 rounded-3xl p-8 shadow-xl">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400/20 border border-yellow-400/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-400/20 border border-green-400/50" />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#FFF5EC] flex items-center justify-center">
                                                <LineChart className="w-5 h-5 text-[#F48D5C]" />
                                            </div>
                                            <div className="text-sm font-semibold text-slate-900">Conversion Rate</div>
                                        </div>
                                        <span className="text-[#F48D5C] font-bold">+12.5%</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#FFF5EC] flex items-center justify-center">
                                                <Users className="w-5 h-5 text-[#F48D5C]" />
                                            </div>
                                            <div className="text-sm font-semibold text-slate-900">New Leads</div>
                                        </div>
                                        <span className="text-slate-900 font-bold">1,240</span>
                                    </div>
                                </div>
                                
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-sm text-slate-500 mb-1">Total Revenue</div>
                                            <div className="text-3xl font-bold text-slate-900">$42,500</div>
                                        </div>
                                        <div className="h-16 flex items-end gap-1.5">
                                            {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                                                <div key={i} className="w-4 bg-[#F48D5C] rounded-t-sm" style={{ height: `${h}%`, opacity: 0.5 + (i * 0.1) }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section id="use-cases" className="relative py-24 px-6 z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 text-center">
                        <h2 className="mb-6 text-3xl font-bold lg:text-5xl text-slate-900">Built for Every Use Case</h2>
                        <p className="mx-auto max-w-2xl text-slate-500 text-lg">
                            From assessments to surveys, D'Quizz adapts to your needs
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <UseCaseCard title="Scorecards" description="Help prospects assess their readiness or maturity level" />
                        <UseCaseCard title="Assessments" description="Evaluate skills, knowledge, or fit for your offerings" />
                        <UseCaseCard title="Lead Magnets" description="Exchange valuable insights for contact information" />
                        <UseCaseCard title="Surveys" description="Gather feedback and understand your audience better" />
                        <UseCaseCard title="Waitlists" description="Build anticipation and qualify early adopters" />
                        <UseCaseCard title="Qualifiers" description="Pre-qualify leads before sales conversations" />
                    </div>
                </div>
            </section>

            {/* Testimonials / Social Proof */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">What people are saying</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <TestimonialCard 
                            quote="Simple, powerful, and effective. It helped me segment my audience and build trust before I even pitch my product."
                            author="Sarah Jenks"
                            role="Founder, Live More"
                        />
                        <TestimonialCard 
                            quote="The scoring logic is incredibly flexible. We use it for pre-qualifying leads and it has saved our sales team hundreds of hours."
                            author="Mark Thompson"
                            role="CMO, TechFlow"
                        />
                        <TestimonialCard 
                            quote="Best lead magnet I've ever created. My cost per lead dropped by 60% within the first week of launching."
                            author="David Chen"
                            role="Growth Consultant"
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="relative rounded-[2.5rem] overflow-hidden p-12 lg:p-16 text-center bg-[#F48D5C] shadow-2xl shadow-[#F48D5C]/20">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#F48D5C] to-[#E85D04]" />
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
                        
                        <div className="relative z-10">
                            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-white tracking-tight">Ready to start?</h2>
                            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Everything you need to accept card payments and grow your business anywhere on the planet.
                            </p>
                            <Link href={login()}>
                                <Button size="lg" className="h-14 px-10 text-lg bg-white text-[#E85D04] hover:bg-white/90 shadow-xl border-none rounded-xl font-bold">
                                    Get Started Now
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-[#F48D5C]/30 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-xl bg-[#FFF5EC] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-[#F48D5C]">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{description}</p>
        </div>
    );
}

function StepItem({ number, title, description, active }: { number: string, title: string, description: string, active?: boolean }) {
    return (
        <div className={`flex gap-6 group cursor-default`}>
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${active ? 'bg-[#F48D5C] text-white shadow-lg shadow-[#F48D5C]/30' : 'bg-slate-100 text-slate-400 group-hover:bg-[#F48D5C]/10 group-hover:text-[#F48D5C]'}`}>
                    {number}
                </div>
                {!active && <div className="w-px h-full bg-slate-200 my-4" />}
            </div>
            <div className="pb-12 pt-1">
                <h3 className={`text-xl font-bold mb-2 transition-colors ${active ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-700'}`}>{title}</h3>
                <p className={`text-base transition-colors ${active ? 'text-slate-600' : 'text-slate-400 group-hover:text-slate-500'}`}>{description}</p>
            </div>
        </div>
    );
}

function UseCaseCard({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:border-[#F48D5C]/30 hover:shadow-md cursor-default">
            <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
        </div>
    );
}

function TestimonialCard({ quote, author, role }: { quote: string, author: string, role: string }) {
    return (
        <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="mb-6 text-[#F48D5C]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 7.55228 14.017 7V3H19.017C20.6739 3 22.017 4.34315 22.017 6V15C22.017 16.6569 20.6739 18 19.017 18H16.017C15.4647 18 15.017 18.4477 15.017 19V21H14.017ZM5.0166 21L5.0166 18C5.0166 16.8954 5.91196 16 7.0166 16H10.0166C10.5689 16 11.0166 15.5523 11.0166 15V9C11.0166 8.44772 10.5689 8 10.0166 8H6.0166C5.46432 8 5.0166 7.55228 5.0166 7V3H10.0166C11.6735 3 13.0166 4.34315 13.0166 6V15C13.0166 16.6569 11.6735 18 10.0166 18H7.0166C6.46432 18 6.0166 18.4477 6.0166 19V21H5.0166Z" />
                </svg>
            </div>
            <p className="text-slate-700 mb-6 leading-relaxed text-lg">"{quote}"</p>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FFF5EC] border border-[#F48D5C]/20" />
                <div>
                    <div className="font-bold text-slate-900">{author}</div>
                    <div className="text-sm text-slate-500">{role}</div>
                </div>
            </div>
        </div>
    );
}
