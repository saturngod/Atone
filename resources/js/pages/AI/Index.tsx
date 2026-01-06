import { Button } from '@/components/ui/button';
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
    Mic,
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
    'Add coffee $5 yesterday',
    'How much did I spend at Starbucks?',
    'Show me spending by merchant this month',
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
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, result]);

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
            <div className="flex h-[calc(100vh-4rem)] flex-col">
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b bg-background px-4 py-3 md:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold">
                                AI Assistant
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Ask questions about your finances
                            </p>
                        </div>
                    </div>
                    {messages.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={startNewChat}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Chat
                        </Button>
                    )}
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">
                    <div className="mx-auto max-w-3xl space-y-4">
                        {/* Chat history */}
                        {messages.length > 0 && (
                            <div className="space-y-4">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-3 ${
                                            msg.role === 'user'
                                                ? 'justify-end'
                                                : 'justify-start'
                                        }`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                                msg.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-background shadow-sm'
                                            }`}
                                        >
                                            {msg.role === 'assistant' &&
                                            msg.tool_calls &&
                                            msg.tool_calls.length > 0 ? (
                                                <span className="text-sm text-muted-foreground">
                                                    🛠 Processing...
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
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                                                <User className="h-4 w-4 text-primary-foreground" />
                                            </div>
                                        )}
                                    </div>
                                ))}
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
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                    <Bot className="h-8 w-8 text-primary" />
                                </div>
                                <h2 className="mb-2 text-xl font-semibold">
                                    How can I help you today?
                                </h2>
                                <p className="mb-8 text-center text-muted-foreground">
                                    Ask me anything about your finances - check
                                    balances, add transactions, or get spending
                                    insights.
                                </p>
                                <div className="grid w-full max-w-lg gap-2">
                                    {EXAMPLE_QUERIES.map((example) => (
                                        <button
                                            key={example}
                                            type="button"
                                            onClick={() => setPrompt(example)}
                                            className="rounded-xl border bg-background p-4 text-left text-sm transition-all hover:border-primary hover:shadow-md"
                                        >
                                            {example}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Area */}
                <div className="shrink-0 border-t bg-background p-4 md:p-6">
                    <form
                        onSubmit={handleSubmit}
                        className="mx-auto flex max-w-3xl gap-3"
                    >
                        <div className="relative flex-1">
                            <Input
                                placeholder="Ask about your finances..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isProcessing}
                                className="h-12 pr-12 text-base"
                                autoFocus
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <Mic className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            type="submit"
                            disabled={isProcessing || !prompt.trim()}
                            size="lg"
                            className="h-12 px-6"
                        >
                            {isProcessing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
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
                <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl bg-background p-8 text-center shadow-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <Sparkles className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium text-green-600">
                            Transaction Added!
                        </p>
                        {result.transaction && (
                            <div className="text-sm text-muted-foreground">
                                <p>
                                    {formatCurrency(result.transaction.amount)}{' '}
                                    - {result.transaction.description}
                                </p>
                                <p className="mt-1">
                                    {result.transaction.category?.name} via{' '}
                                    {result.transaction.account?.name}
                                </p>
                            </div>
                        )}
                    </div>
                    <Button onClick={onNewQuery} variant="outline" size="sm">
                        Add Another
                    </Button>
                </div>
            );

        case 'transactions_list':
            return (
                <div className="space-y-4 rounded-2xl bg-background p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {result.count} transaction
                            {result.count !== 1 ? 's' : ''} found
                        </p>
                        <Button onClick={onNewQuery} variant="ghost" size="sm">
                            New Query
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {result.transactions?.map((t) => (
                            <div
                                key={t.id}
                                className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
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
                                    className={`font-medium ${
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
                </div>
            );

        case 'spending_summary':
            return (
                <div className="space-y-4 rounded-2xl bg-background p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {result.period?.start} - {result.period?.end}
                        </p>
                        <Button onClick={onNewQuery} variant="ghost" size="sm">
                            New Query
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-green-50 p-4 text-center dark:bg-green-900/20">
                            <ArrowUpCircle className="mx-auto h-6 w-6 text-green-600" />
                            <p className="mt-2 text-xs text-muted-foreground">
                                Income
                            </p>
                            <p className="text-lg font-semibold text-green-600">
                                ${result.summary?.total_income.toFixed(2)}
                            </p>
                        </div>
                        <div className="rounded-xl bg-red-50 p-4 text-center dark:bg-red-900/20">
                            <ArrowDownCircle className="mx-auto h-6 w-6 text-red-600" />
                            <p className="mt-2 text-xs text-muted-foreground">
                                Expense
                            </p>
                            <p className="text-lg font-semibold text-red-600">
                                ${result.summary?.total_expense.toFixed(2)}
                            </p>
                        </div>
                        <div className="rounded-xl bg-muted p-4 text-center">
                            <Wallet className="mx-auto h-6 w-6 text-muted-foreground" />
                            <p className="mt-2 text-xs text-muted-foreground">
                                Net
                            </p>
                            <p
                                className={`text-lg font-semibold ${
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
                </div>
            );

        case 'category_breakdown':
        case 'account_breakdown':
            return (
                <div className="space-y-4 rounded-2xl bg-background p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Total: ${result.total?.toFixed(2)}
                        </p>
                        <Button onClick={onNewQuery} variant="ghost" size="sm">
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
                                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                                        <div
                                            className="h-2 rounded-full bg-primary"
                                            style={{
                                                width: `${item.percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'balance':
            return (
                <div className="space-y-4 rounded-2xl bg-background p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Current Balances
                        </p>
                        <Button onClick={onNewQuery} variant="ghost" size="sm">
                            New Query
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {result.accounts?.map((account, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                            >
                                <div className="flex items-center gap-2">
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
                                <span className="font-medium">
                                    ${account.balance.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="rounded-xl border bg-muted/50 p-4">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Total Balance</span>
                            <span className="text-xl font-bold">
                                ${result.total_balance?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            );

        case 'chat':
            return null;

        default:
            return (
                <div className="space-y-4 rounded-2xl bg-background p-6 shadow-sm">
                    <pre className="text-xs">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                    <Button onClick={onNewQuery} variant="outline" size="sm">
                        New Query
                    </Button>
                </div>
            );
    }
}
