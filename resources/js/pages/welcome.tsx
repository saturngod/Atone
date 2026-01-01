import { dashboard, login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
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
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                {canRegister && registerUrl && (
                                    <Link
                                        href={registerUrl}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
                        <div className="flex-1 rounded-br-lg rounded-bl-lg bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-20 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
                            <h1 className="mb-1 text-2xl font-medium">
                                Personal Finance App
                            </h1>
                            <p className="mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                Track your finances with AI-powered insights.
                                Create transactions using natural language and
                                visualize your spending patterns.
                            </p>

                            <div className="mb-6 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                        <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            AI-Powered Transactions
                                        </span>
                                        <p className="mt-0.5 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                            Create transactions using natural
                                            language with OpenAI/Nemotron
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            Analytics Dashboard
                                        </span>
                                        <p className="mt-0.5 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                            Track daily, monthly, and yearly
                                            spending by account and category
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                        <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                            />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                            Category Management
                                        </span>
                                        <p className="mt-0.5 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                            Organize transactions with custom
                                            categories and merchants
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-block rounded-sm border border-black bg-[#1b1b18] px-5 py-2 text-sm leading-normal text-white hover:border-black hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                                    >
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="inline-block rounded-sm border border-[#19140035] px-5 py-2 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && registerUrl && (
                                            <Link
                                                href={registerUrl}
                                                className="inline-block rounded-sm border border-black bg-[#1b1b18] px-5 py-2 text-sm leading-normal text-white hover:border-black hover:bg-black dark:border-[#eeeeec] dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:border-white dark:hover:bg-white"
                                            >
                                                Get Started
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="mt-8 border-t border-[#e3e3e0] pt-6 dark:border-[#3E3E3A]">
                                <p className="mb-3 text-xs text-[#706f6c] dark:text-[#A1A09A]">
                                    Built with
                                </p>
                                <div className="flex flex-wrap gap-4 text-xs">
                                    <a
                                        href="https://laravel.com"
                                        target="_blank"
                                        className="text-[#f53003] hover:underline"
                                    >
                                        Laravel 11
                                    </a>
                                    <a
                                        href="https://react.dev"
                                        target="_blank"
                                        className="text-[#f53003] hover:underline"
                                    >
                                        React 18
                                    </a>
                                    <a
                                        href="https://inertiajs.com"
                                        target="_blank"
                                        className="text-[#f53003] hover:underline"
                                    >
                                        Inertia.js
                                    </a>
                                    <a
                                        href="https://tailwindcss.com"
                                        target="_blank"
                                        className="text-[#f53003] hover:underline"
                                    >
                                        Tailwind CSS
                                    </a>
                                    <a
                                        href="https://openai.com"
                                        target="_blank"
                                        className="text-[#f53003] hover:underline"
                                    >
                                        OpenAI
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="relative -mb-px aspect-[335/376] w-full shrink-0 overflow-hidden rounded-t-lg bg-gradient-to-br from-[#1b1b18] to-[#3E3E3A] lg:mb-0 lg:-ml-px lg:aspect-auto lg:w-[438px] lg:rounded-t-none lg:rounded-r-lg dark:from-[#161615] dark:to-[#2a2a2a]">
                            <div className="absolute inset-0 flex items-center justify-center p-8">
                                <div className="w-full max-w-[280px]">
                                    <div className="mb-6 text-center">
                                        <svg
                                            className="mx-auto mb-4 h-16 w-16 text-[#f53003]"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <h2 className="text-xl font-semibold text-white">
                                            Smart Finance Tracking
                                        </h2>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
                                            <div className="mb-2 flex justify-between text-sm text-white">
                                                <span>Monthly Budget</span>
                                                <span className="text-green-400">
                                                    $2,450 / $3,000
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-white/20">
                                                <div
                                                    className="h-full rounded-full bg-[#f53003]"
                                                    style={{ width: '82%' }}
                                                />
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
                                            <div className="mb-2 flex justify-between text-sm text-white">
                                                <span>Savings Goal</span>
                                                <span className="text-blue-400">
                                                    75%
                                                </span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-white/20">
                                                <div
                                                    className="h-full rounded-full bg-blue-500"
                                                    style={{ width: '75%' }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between rounded-lg bg-white/10 p-4 backdrop-blur">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                                                    <svg
                                                        className="h-5 w-5 text-green-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-sm text-white">
                                                    New Transaction
                                                </span>
                                            </div>
                                            <svg
                                                className="h-5 w-5 text-white/50"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </div>

                                        <div className="rounded-lg bg-white/10 p-4 backdrop-blur">
                                            <div className="mb-3 flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20">
                                                    <svg
                                                        className="h-4 w-4 text-purple-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-sm text-white">
                                                    AI Analysis
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/60">
                                                Your spending is 15% lower than
                                                last month!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 rounded-t-lg shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-t-none lg:rounded-r-lg dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]" />
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
