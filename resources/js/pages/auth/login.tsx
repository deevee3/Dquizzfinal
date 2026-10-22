import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { Globe, KeyRound, Sparkles, Zap } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: 'test@dquizz.com',
        password: 'password123',
    });

    const testForm = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    const handleTestLogin = () => {
        testForm.post('/login/test');
    };

    return (
        <div className="min-h-screen bg-[#FDF8F4] text-slate-900 flex flex-col justify-center items-center px-6 relative overflow-hidden">
            <Head title="Sign In - D'Quizz" />

            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[#F9DCD3] rounded-full blur-[120px] opacity-60 mix-blend-multiply" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#F9DCD3] rounded-full blur-[120px] opacity-60 mix-blend-multiply" />
            </div>

            <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl border border-[#E97451]/20 rounded-2xl shadow-xl p-8">
                <div className="flex flex-col items-center text-center mb-8">
                    <Link href="/" className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-xl bg-[#E97451] flex items-center justify-center shadow-lg shadow-[#E97451]/20">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900">D'Quizz</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
                    <p className="text-sm text-slate-500 mt-1">Sign in to manage your interactive quizzes and funnels</p>
                </div>

                {/* Email / Password Form */}
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="test@dquizz.com"
                            required
                        />
                        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                    </div>

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-[#E97451] hover:bg-[#C75B32] text-white font-semibold h-11"
                    >
                        <KeyRound className="w-4 h-4 mr-2" />
                        {processing ? 'Signing in...' : 'Sign In with Email'}
                    </Button>
                </form>

                <div className="my-6 flex items-center gap-3">
                    <div className="h-px bg-slate-200 flex-1" />
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Or</span>
                    <div className="h-px bg-slate-200 flex-1" />
                </div>

                <div className="space-y-3">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={testForm.processing}
                        onClick={handleTestLogin}
                        className="w-full border-[#E97451]/30 bg-[#FDF8F4] hover:bg-[#F9DCD3]/60 text-slate-800 font-medium h-11"
                    >
                        <Sparkles className="w-4 h-4 mr-2 text-[#E97451]" />
                        Quick Login (Test Account)
                    </Button>

                    <a href="/login/workos" className="block">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full border-slate-200 hover:bg-slate-50 text-slate-700 font-medium h-11"
                        >
                            <Globe className="w-4 h-4 mr-2 text-slate-500" />
                            Continue with WorkOS (Google / SSO)
                        </Button>
                    </a>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 text-center space-y-1">
                    <p className="font-medium text-slate-700">Test Credentials:</p>
                    <p>
                        Email: <code className="bg-slate-100 px-1.5 py-0.5 rounded">test@dquizz.com</code> &bull; Password:{' '}
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded">password123</code>
                    </p>
                </div>
            </div>
        </div>
    );
}
