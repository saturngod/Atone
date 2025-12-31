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
import { Bot, Loader2, Mic, Send, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

interface AIChatDialogProps {
    children?: React.ReactNode;
}

export function AIChatDialog({ children }: AIChatDialogProps) {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isProcessing) return;

        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post(ai.transaction.url(), {
                prompt,
            });

            setResult(
                `Transaction created: $${Math.abs(response.data.transaction.amount).toFixed(2)} for ${response.data.transaction.description} on ${response.data.transaction.date}`,
            );
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
                <div className="flex h-full max-h-[600px] flex-col sm:h-auto sm:max-h-[70vh]">
                    <div className="flex shrink-0 items-center justify-between border-b p-4">
                        <DialogTitle className="flex items-center gap-2 text-base">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <Bot className="h-4 w-4 text-primary" />
                            </div>
                            AI Transaction
                        </DialogTitle>

                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                        {result ? (
                            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                    <Sparkles className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-green-600">
                                        Transaction Added!
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {result}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => {
                                        setResult(null);
                                        setPrompt('');
                                    }}
                                    variant="outline"
                                    size="sm"
                                >
                                    Add Another
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 rounded-xl bg-muted/50 p-4">
                                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Quick Examples
                                    </p>
                                    <div className="grid gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPrompt(
                                                    'Bought coffee at Starbucks for $5.50 yesterday using Apple Card',
                                                )
                                            }
                                            className="rounded-lg bg-background p-3 text-left text-sm transition-colors hover:bg-accent"
                                        >
                                            "Bought coffee at Starbucks for
                                            $5.50 yesterday using Apple Card"
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPrompt(
                                                    'Salary deposit $3000 on the 1st via Bank Account',
                                                )
                                            }
                                            className="rounded-lg bg-background p-3 text-left text-sm transition-colors hover:bg-accent"
                                        >
                                            "Salary deposit $3000 on the 1st via
                                            Bank Account"
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Or describe your transaction in your own
                                        words
                                    </p>
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
                                    placeholder="Describe your transaction..."
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

export function AIChatFAB() {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isProcessing) return;

        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post(ai.transaction.url(), {
                prompt,
            });

            setResult(
                `Transaction created: $${Math.abs(response.data.transaction.amount).toFixed(2)} for ${response.data.transaction.description} on ${response.data.transaction.date}`,
            );
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
                            AI Transaction
                        </DialogTitle>

                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto p-4">
                        {result ? (
                            <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                    <Sparkles className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium text-green-600">
                                        Transaction Added!
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {result}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => {
                                        setResult(null);
                                        setPrompt('');
                                    }}
                                    variant="outline"
                                    size="sm"
                                >
                                    Add Another
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3 rounded-xl bg-muted/50 p-4">
                                    <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                                        Quick Examples
                                    </p>
                                    <div className="grid gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPrompt(
                                                    'Bought coffee at Starbucks for $5.50 yesterday using Apple Card',
                                                )
                                            }
                                            className="rounded-lg bg-background p-3 text-left text-sm transition-colors hover:bg-accent"
                                        >
                                            "Bought coffee at Starbucks for
                                            $5.50 yesterday using Apple Card"
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPrompt(
                                                    'Salary deposit $3000 on the 1st via Bank Account',
                                                )
                                            }
                                            className="rounded-lg bg-background p-3 text-left text-sm transition-colors hover:bg-accent"
                                        >
                                            "Salary deposit $3000 on the 1st via
                                            Bank Account"
                                        </button>
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
                                    placeholder="Describe your transaction..."
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
