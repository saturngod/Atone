import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Brain,
    CheckCircle2,
    MessageSquare,
    Shield,
    Sparkles,
    Wallet,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;
    const [registerUrl, setRegisterUrl] = useState<string | null>(null);

    const loadRegisterUrl = useCallback(async () => {
        if (registerUrl) return registerUrl;

        try {
            const routeModule = await import('@/routes');
            const routeModuleAny = routeModule as Record<string, unknown>;
            const registerFn = routeModuleAny.register as
                | (() => { url: string })
                | undefined;
            const route = registerFn?.();
            if (route) {
                const url = route.url;
                setRegisterUrl(url);
                return url;
            }
        } catch {
            // Route not available
        }

        return '#';
    }, [registerUrl]);

    useEffect(() => {
        if (canRegister) {
            loadRegisterUrl();
        }
    }, [canRegister, loadRegisterUrl]);

    return (
        <>
            <Head title="Welcome to SPF">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-orange-500/20 dark:bg-neutral-950 dark:text-neutral-50">
                {/* Navigation */}
                <header className="fixed top-0 z-50 w-full border-b border-white/50 bg-white/50 backdrop-blur-xl dark:border-neutral-800/50 dark:bg-neutral-950/50">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-white shadow-lg shadow-orange-500/20">
                                <AppLogoIcon className="h-5 w-5" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                SPF
                            </span>
                        </div>

                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link href={dashboard()}>
                                    <Button>Go to Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister && registerUrl && (
                                        <Link href={registerUrl}>
                                            <Button>Get Started</Button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="pt-24">
                    {/* Hero Section */}
                    <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
                        <div className="absolute top-0 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-orange-500/20 opacity-30 blur-[100px] filter dark:bg-orange-500/10"></div>

                        <div className="mx-auto max-w-4xl text-center">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-600 dark:text-orange-400">
                                <Sparkles className="h-4 w-4" />
                                <span>Powered by OpenAI & Nemotron</span>
                            </div>

                            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl">
                                Master Your Money with{' '}
                                <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-amber-400">
                                    AI Intelligence
                                </span>
                            </h1>

                            <p className="mx-auto mb-10 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                                Stop manually entering numbers. Just talk to
                                SPF. Our advanced AI parses your natural
                                language to track expenses, categorize
                                transactions, and forecast your financial
                                future.
                            </p>

                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                {auth.user ? (
                                    <Link href={dashboard()}>
                                        <Button
                                            size="lg"
                                            className="h-12 px-8 text-base shadow-xl shadow-orange-500/20"
                                        >
                                            Return to Dashboard
                                        </Button>
                                    </Link>
                                ) : (
                                    <>
                                        {canRegister && registerUrl && (
                                            <Link href={registerUrl}>
                                                <Button
                                                    size="lg"
                                                    className="h-12 px-8 text-base shadow-xl shadow-orange-500/20"
                                                >
                                                    Start for Free
                                                </Button>
                                            </Link>
                                        )}
                                        <Link href={login()}>
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="h-12 px-8 text-base"
                                            >
                                                Live Demo
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Visual / Mockup Area */}
                        <div className="relative mx-auto mt-20 max-w-5xl">
                            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white/50 shadow-2xl backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                                <div className="border-b border-neutral-200 bg-white/80 p-4 dark:border-neutral-800 dark:bg-neutral-900/80">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-500/20"></div>
                                        <div className="h-3 w-3 rounded-full bg-yellow-500/20"></div>
                                        <div className="h-3 w-3 rounded-full bg-green-500/20"></div>
                                    </div>
                                </div>
                                <div className="p-8 md:p-12">
                                    <div className="grid gap-12 md:grid-cols-2">
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                                        <MessageSquare className="h-5 w-5" />
                                                    </div>
                                                    <div className="rounded-2xl rounded-tl-none bg-neutral-100 p-4 text-sm dark:bg-neutral-800">
                                                        <p>
                                                            Spent $45 on
                                                            groceries at Whole
                                                            Foods and $12 for
                                                            coffee at Starbucks
                                                            today.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start justify-end gap-4">
                                                    <div className="rounded-2xl rounded-tr-none bg-orange-600 p-4 text-sm text-white">
                                                        <p>
                                                            I've recorded those
                                                            for you. Your
                                                            grocery budget is
                                                            now at 82% for the
                                                            month.
                                                        </p>
                                                    </div>
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                                                        <Brain className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6 rounded-xl border border-neutral-200 bg-neutral-50/50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
                                            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                Recent Transactions
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/20">
                                                            <div className="i-lucide-shopping-cart h-5 w-5" />
                                                            🛒
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                Whole Foods
                                                            </p>
                                                            <p className="text-xs text-neutral-500">
                                                                Groceries
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                                        -$45.00
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/20">
                                                            <div className="i-lucide-coffee h-5 w-5" />
                                                            ☕
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                Starbucks
                                                            </p>
                                                            <p className="text-xs text-neutral-500">
                                                                Dining Out
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                                        -$12.00
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Grid */}
                    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon={<MessageSquare className="h-6 w-6" />}
                                title="Natural Language"
                                description="Just text or say what you spent. Our AI understands context, dates, and categories automatically."
                            />
                            <FeatureCard
                                icon={<Brain className="h-6 w-6" />}
                                title="Smart Categorization"
                                description="Transactions are automatically categorized based on merchant data and your spending history."
                            />
                            <FeatureCard
                                icon={<BarChart3 className="h-6 w-6" />}
                                title="Deep Analytics"
                                description="Visualize your spending patterns with beautiful, interactive charts and monthly reports."
                            />
                            <FeatureCard
                                icon={<Wallet className="h-6 w-6" />}
                                title="Multi-Currency"
                                description="Seamlessly handle transactions in multiple currencies with real-time exchange rates."
                            />
                            <FeatureCard
                                icon={<Shield className="h-6 w-6" />}
                                title="Private & Secure"
                                description="Your financial data is encrypted and never shared. You have complete control over your information."
                            />
                            <FeatureCard
                                icon={<CheckCircle2 className="h-6 w-6" />}
                                title="Goal Tracking"
                                description="Set budgets and savings goals. Get notified when you're getting close to your limits."
                            />
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="border-t border-neutral-200 bg-white py-12 dark:border-neutral-800 dark:bg-neutral-950">
                        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                            <div className="mb-4 flex items-center justify-center gap-2">
                                <AppLogoIcon className="h-6 w-6 text-neutral-900 dark:text-neutral-100" />
                                <span className="text-xl font-bold tracking-tight">
                                    SPF
                                </span>
                            </div>
                            <p className="text-sm text-neutral-500">
                                &copy; {new Date().getFullYear()} Simple
                                Personal Finance. All rights reserved.
                            </p>
                        </div>
                    </footer>
                </main>
            </div>
        </>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="group rounded-2xl border border-neutral-200 bg-white p-8 transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white dark:bg-neutral-800 dark:text-orange-400 dark:group-hover:bg-orange-600 dark:group-hover:text-white">
                {icon}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {title}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
                {description}
            </p>
        </div>
    );
}
