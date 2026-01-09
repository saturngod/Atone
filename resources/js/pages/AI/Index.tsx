import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Bot,
    Loader2,
    MessageSquare,
    Plus,
    Send,
    Sparkles,
    User,
    Wallet,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string | null;
    tool_calls?: Array<{
        id: string;
        type: string;
        function: {
            name: string;
            arguments: string;
        };
    }>;
}

interface TransactionResult {
    id: number;
    amount: number;
    description: string | null;
    date: string;
    account: {
        id: number;
        name: string;
        color: string;
    } | null;
    category: {
        id: number;
        name: string;
    } | null;
}

interface ResponseData {
    type: string;
    message?: string;
    transaction?: TransactionResult;
    transactions?: TransactionResult[];
    count?: number;
    summary?: {
        total_income: number;
        total_expense: number;
        net_amount: number;
    };
    period?: {
        start: string;
        end: string;
    };
    total?: number;
    breakdown?: Array<{
        category?: string;
        account?: string;
        amount: number;
        percentage: number;
    }>;
    accounts?: Array<{
        name: string;
        balance: number;
        color: string;
    }>;
    total_balance?: number;
    total_income?: number;
    total_expense?: number;
    assistant_message?: Message;
}

function formatCurrency(amount: number): string {
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

const EXAMPLE_QUERIES = [
    'How much did I spend this month?',
    'Show me transactions last week',
    'What is my total balance?',
    'Add coffee $5 at Starbucks yesterday',
    'How much did I spend at Starbucks?',
    'Show me spending by category this month',
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'AI Assistant',
        href: '/ai',
    },
];

export default function AIChat() {
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<ResponseData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Handle mobile keyboard visibility
    useEffect(() => {
        const handleResize = () => {
            if (window.visualViewport) {
                const viewportHeight = window.visualViewport.height;
                const windowHeight = window.innerHeight;
                const heightDiff = windowHeight - viewportHeight;
                setKeyboardHeight(heightDiff > 150 ? heightDiff : 0);
            }
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
            return () => {
                window.visualViewport!.removeEventListener(
                    'resize',
                    handleResize,
                );
            };
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, result, keyboardHeight]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isProcessing) return;

        const userMessage: Message = { role: 'user', content: prompt };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);

        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('/ai', {
                prompt,
                messages: newMessages,
            });

            if (response.data.assistant_message) {
                const updatedMessages = [
                    ...newMessages,
                    response.data.assistant_message,
                ];
                setMessages(updatedMessages);
            }

            setResult(response.data);
            setPrompt('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setMessages(messages);
        } finally {
            setIsProcessing(false);
        }
    };

    const resetAndNew = () => {
        setResult(null);
        setPrompt('');
    };

    const startNewChat = () => {
        setMessages([]);
        setResult(null);
        setError(null);
        setPrompt('');
    };

    const showResult = result && result.type !== 'chat';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="AI Assistant" />
            <div
                className="flex h-[calc(100dvh-4rem)] flex-col"
                style={{
                    paddingBottom:
                        keyboardHeight > 0 ? `${keyboardHeight}px` : '0',
                }}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b bg-background px-4 py-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                            <Bot className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight">
                                AI Assistant
                            </h1>
                            <p className="hidden text-sm text-muted-foreground sm:block">
                                Ask questions about your finances
                            </p>
                        </div>
                    </div>
                    {messages.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={startNewChat}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            New Chat
                        </Button>
                    )}
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">
                    <div className="mx-auto max-w-3xl space-y-4">
                        {/* Chat history */}
                        {messages.length > 0 && (
                            <div className="space-y-4">
                                {messages.map((msg, index) => {
                                    const isLastMessage =
                                        index === messages.length - 1;
                                    const showProcessing =
                                        msg.role === 'assistant' &&
                                        msg.tool_calls &&
                                        msg.tool_calls.length > 0 &&
                                        isProcessing &&
                                        isLastMessage &&
                                        !msg.content;

                                    return (
                                        <div
                                            key={index}
                                            className={`flex gap-3 ${
                                                msg.role === 'user'
                                                    ? 'justify-end'
                                                    : 'justify-start'
                                            }`}
                                        >
                                            {msg.role === 'assistant' && (
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                                                    <Bot className="h-4 w-4 text-violet-600" />
                                                </div>
                                            )}
                                            <div
                                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                                    msg.role === 'user'
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'border bg-background shadow-sm'
                                                }`}
                                            >
                                                {showProcessing ? (
                                                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        Processing...
                                                    </span>
                                                ) : msg.content ? (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                                        <ReactMarkdown
                                                            remarkPlugins={[
                                                                remarkGfm,
                                                            ]}
                                                        >
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                ) : null}
                                            </div>
                                            {msg.role === 'user' && (
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                                                    <User className="h-4 w-4 text-primary-foreground" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {showResult && (
                            <AIResult
                                result={result}
                                onNewQuery={resetAndNew}
                            />
                        )}

                        {messages.length === 0 && !showResult && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                                    <Bot className="h-8 w-8 text-violet-600" />
                                </div>
                                <h2 className="mb-2 text-xl font-semibold tracking-tight">
                                    How can I help you today?
                                </h2>
                                <p className="mb-6 max-w-md px-4 text-center text-sm text-muted-foreground sm:mb-8 sm:text-base">
                                    Ask me anything about your finances - check
                                    balances, add transactions, or get spending
                                    insights.
                                </p>
                                <div className="grid w-full max-w-lg gap-2 px-2 sm:px-0">
                                    {EXAMPLE_QUERIES.map((example) => (
                                        <button
                                            key={example}
                                            type="button"
                                            onClick={() => setPrompt(example)}
                                            className="flex items-center gap-2 rounded-xl border bg-background p-3 text-left text-sm transition-all hover:border-violet-300 hover:bg-violet-50/50 hover:shadow-sm sm:gap-3 sm:p-4 dark:hover:bg-violet-950/20"
                                        >
                                            <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <span className="line-clamp-1">
                                                {example}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="shrink-0 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 md:p-6 md:pb-6">
                    <form
                        onSubmit={handleSubmit}
                        className="mx-auto flex max-w-3xl gap-2 sm:gap-3"
                    >
                        <div className="relative flex-1">
                            <Input
                                ref={inputRef}
                                placeholder="Ask about your finances..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isProcessing}
                                className="h-11 rounded-xl pr-4 text-base sm:h-12"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isProcessing || !prompt.trim()}
                            size="lg"
                            className="h-11 gap-2 rounded-xl px-4 sm:h-12 sm:px-6"
                        >
                            {isProcessing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Send
                                    </span>
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

function AIResult({
    result,
    onNewQuery,
}: {
    result: ResponseData;
    onNewQuery: () => void;
}) {
    switch (result.type) {
        case 'transaction_created':
            return (
                <Card className="overflow-hidden">
                    <CardContent className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                            <Sparkles className="h-7 w-7 text-green-600" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-green-600">
                                Transaction Added!
                            </p>
                            {result.transaction && (
                                <div className="text-sm text-muted-foreground">
                                    <p className="font-medium">
                                        {formatCurrency(
                                            result.transaction.amount,
                                        )}{' '}
                                        - {result.transaction.description}
                                    </p>
                                    <p className="mt-1">
                                        {result.transaction.category?.name} via{' '}
                                        {result.transaction.account?.name}
                                    </p>
                                </div>
                            )}
                        </div>
                        <Button
                            onClick={onNewQuery}
                            variant="outline"
                            size="sm"
                        >
                            Add Another
                        </Button>
                    </CardContent>
                </Card>
            );

        case 'transactions_list':
            return (
                <Card>
                    <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">
                                {result.count} transaction
                                {result.count !== 1 ? 's' : ''} found
                            </p>
                            <Button
                                onClick={onNewQuery}
                                variant="ghost"
                                size="sm"
                            >
                                New Query
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {result.transactions?.map((t) => (
                                <div
                                    key={t.id}
                                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">
                                            {t.description || 'No description'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {t.category?.name} ·{' '}
                                            {formatDate(t.date)}
                                        </span>
                                    </div>
                                    <span
                                        className={`font-semibold ${
                                            t.amount >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}
                                    >
                                        {formatCurrency(t.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            );

        case 'spending_summary':
            return (
                <Card>
                    <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">
                                {result.period?.start} - {result.period?.end}
                            </p>
                            <Button
                                onClick={onNewQuery}
                                variant="ghost"
                                size="sm"
                            >
                                New Query
                            </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-xl bg-green-50 p-4 text-center dark:bg-green-900/20">
                                <ArrowUpCircle className="mx-auto h-6 w-6 text-green-600" />
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Income
                                </p>
                                <p className="text-lg font-bold text-green-600">
                                    ${result.summary?.total_income.toFixed(2)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-red-50 p-4 text-center dark:bg-red-900/20">
                                <ArrowDownCircle className="mx-auto h-6 w-6 text-red-600" />
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Expense
                                </p>
                                <p className="text-lg font-bold text-red-600">
                                    ${result.summary?.total_expense.toFixed(2)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-muted p-4 text-center">
                                <Wallet className="mx-auto h-6 w-6 text-muted-foreground" />
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Net
                                </p>
                                <p
                                    className={`text-lg font-bold ${
                                        (result.summary?.net_amount ?? 0) >= 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }`}
                                >
                                    $
                                    {Math.abs(
                                        result.summary?.net_amount ?? 0,
                                    ).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );

        case 'category_breakdown':
        case 'account_breakdown':
            return (
                <Card>
                    <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">
                                Total: ${result.total?.toFixed(2)}
                            </p>
                            <Button
                                onClick={onNewQuery}
                                variant="ghost"
                                size="sm"
                            >
                                New Query
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {result.breakdown?.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">
                                                {item.category || item.account}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                ${item.amount.toFixed(2)} (
                                                {item.percentage}%)
                                            </span>
                                        </div>
                                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500"
                                                style={{
                                                    width: `${item.percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            );

        case 'balance':
            return (
                <Card>
                    <CardContent className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-medium text-muted-foreground">
                                Current Balances
                            </p>
                            <Button
                                onClick={onNewQuery}
                                variant="ghost"
                                size="sm"
                            >
                                New Query
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {result.accounts?.map((account, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-3 w-3 rounded-full"
                                            style={{
                                                backgroundColor: account.color,
                                            }}
                                        />
                                        <span className="text-sm font-medium">
                                            {account.name}
                                        </span>
                                    </div>
                                    <span className="font-semibold">
                                        ${account.balance.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 rounded-xl border bg-gradient-to-br from-muted/50 to-muted p-4">
                            <div className="flex items-center justify-between">
                                <span className="font-medium">
                                    Total Balance
                                </span>
                                <span className="text-xl font-bold">
                                    ${result.total_balance?.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );

        case 'chat':
            return null;

        default:
            return (
                <Card>
                    <CardContent className="p-6">
                        <pre className="text-xs">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                        <Button
                            onClick={onNewQuery}
                            variant="outline"
                            size="sm"
                            className="mt-4"
                        >
                            New Query
                        </Button>
                    </CardContent>
                </Card>
            );
    }
}
