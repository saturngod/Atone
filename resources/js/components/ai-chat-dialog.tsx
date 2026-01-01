import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import ai from '@/routes/ai';
import axios from 'axios';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Bot,
    Loader2,
    Mic,
    Send,
    Sparkles,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

interface AIChatDialogProps {
    children?: React.ReactNode;
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

export function AIChatDialog({ children }: AIChatDialogProps) {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<ResponseData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isProcessing) return;

        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            const url = ai.transaction?.url?.() || '/ai/transaction';
            const response = await axios.post(url, {
                prompt,
            });

            setResult(response.data);
            setPrompt('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setPrompt('');
            setResult(null);
            setError(null);
        }
    };

    const resetAndNew = () => {
        setResult(null);
        setPrompt('');
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                className="gap-0 p-0 sm:max-w-[500px]"
                mobileStyle={{
                    borderRadius: '1rem 1rem 0 0',
                    maxHeight: 'calc(100vh - 32px)',
                    height: 'auto',
                    bottom: '16px',
                    margin: '0 8px',
                }}
            >
                <div className="flex max-h-[600px] flex-col">
                    <div className="flex shrink-0 items-center justify-between border-b p-4">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <Bot className="h-4 w-4 text-primary" />
                            </div>
                            AI Assistant
                        </DialogTitle>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto bg-white p-4 dark:bg-black">
                        {result ? (
                            <AIResult
                                result={result}
                                onNewQuery={resetAndNew}
                            />
                        ) : (
                            <>
                                <div className="space-y-3 rounded-xl bg-muted/50 p-4">
                                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Try asking
                                    </p>
                                    <div className="grid gap-2">
                                        {EXAMPLE_QUERIES.map((example) => (
                                            <button
                                                key={example}
                                                type="button"
                                                onClick={() =>
                                                    setPrompt(example)
                                                }
                                                className="rounded-lg bg-background p-3 text-left text-sm transition-colors hover:bg-accent"
                                            >
                                                {example}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {error && (
                            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="shrink-0 border-t bg-background p-4"
                    >
                        <div className="flex gap-2">
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
                                className="h-12 px-4"
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
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
                <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
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
                <div className="space-y-4">
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
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            {result.period?.start} - {result.period?.end}
                        </p>
                        <Button onClick={onNewQuery} variant="ghost" size="sm">
                            New Query
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20">
                            <ArrowUpCircle className="mx-auto h-5 w-5 text-green-600" />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Income
                            </p>
                            <p className="font-semibold text-green-600">
                                ${result.summary?.total_income.toFixed(2)}
                            </p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-3 text-center dark:bg-red-900/20">
                            <ArrowDownCircle className="mx-auto h-5 w-5 text-red-600" />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Expense
                            </p>
                            <p className="font-semibold text-red-600">
                                ${result.summary?.total_expense.toFixed(2)}
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted p-3 text-center">
                            <Wallet className="mx-auto h-5 w-5 text-muted-foreground" />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Net
                            </p>
                            <p
                                className={`font-semibold ${
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
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Total: ${result.total?.toFixed(2)}
                        </p>
                        <Button onClick={onNewQuery} variant="ghost" size="sm">
                            New Query
                        </Button>
                    </div>
                    <div className="space-y-2">
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
                                            {item.percentage}
                                            %)
                                        </span>
                                    </div>
                                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                                        <div
                                            className="h-1.5 rounded-full bg-primary"
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
                <div className="space-y-4">
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
                    <div className="rounded-lg border bg-muted/50 p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                Total Balance
                            </span>
                            <span className="text-lg font-bold">
                                ${result.total_balance?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            );

        case 'chat':
            return (
                <div className="space-y-4">
                    <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm">{result.message}</p>
                    </div>
                    <Button onClick={onNewQuery} variant="outline" size="sm">
                        Ask Another Question
                    </Button>
                </div>
            );

        default:
            return (
                <div className="space-y-4">
                    <div className="rounded-lg bg-muted/50 p-4">
                        <pre className="text-xs">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                    <Button onClick={onNewQuery} variant="outline" size="sm">
                        New Query
                    </Button>
                </div>
            );
    }
}

export function AIChatFAB() {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<ResponseData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isProcessing) return;

        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            const url = ai.transaction?.url?.() || '/ai/transaction';
            const response = await axios.post(url, {
                prompt,
            });

            setResult(response.data);
            setPrompt('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            setPrompt('');
            setResult(null);
            setError(null);
        }
    };

    const resetAndNew = () => {
        setResult(null);
        setPrompt('');
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg sm:hidden">
                    <Bot className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent
                className="gap-0 p-0"
                mobileStyle={{
                    borderRadius: '1rem 1rem 0 0',
                    maxHeight: 'calc(100vh - 32px)',
                    height: 'auto',
                    bottom: '16px',
                    margin: '0 8px',
                }}
            >
                <div className="flex max-h-[600px] flex-col">
                    <div className="flex shrink-0 items-center justify-between border-b p-4">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <Bot className="h-4 w-4 text-primary" />
                            </div>
                            AI Assistant
                        </DialogTitle>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto bg-white p-4 dark:bg-black">
                        {result ? (
                            <AIResult
                                result={result}
                                onNewQuery={resetAndNew}
                            />
                        ) : (
                            <>
                                <div className="space-y-3 rounded-xl bg-muted/50 p-4">
                                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Try asking
                                    </p>
                                    <div className="grid gap-2">
                                        {EXAMPLE_QUERIES.map((example) => (
                                            <button
                                                key={example}
                                                type="button"
                                                onClick={() =>
                                                    setPrompt(example)
                                                }
                                                className="rounded-lg bg-background p-3 text-left text-sm transition-colors hover:bg-accent"
                                            >
                                                {example}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {error && (
                            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="shrink-0 border-t bg-background p-4"
                    >
                        <div className="flex gap-2">
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
                                    className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                                >
                                    <Mic className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button
                                type="submit"
                                disabled={isProcessing || !prompt.trim()}
                                size="lg"
                                className="h-12 px-4"
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Send className="h-5 w-5" />
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
