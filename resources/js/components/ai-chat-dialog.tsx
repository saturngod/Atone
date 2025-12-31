import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import ai from '@/routes/ai';
import axios from 'axios';
import { Bot, Loader2, Send } from 'lucide-react';
import { useState } from 'react';

interface AIChatDialogProps {
    children: React.ReactNode;
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        AI Transaction Assistant
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                        <p className="mb-2 font-medium">Try saying:</p>
                        <ul className="list-inside list-disc space-y-1">
                            <li>
                                &ldquo;Bought coffee at Starbucks for $5.50
                                yesterday using Apple Account&rdquo;
                            </li>
                            <li>
                                &ldquo;Salary deposit of $3000 on the 1st of
                                this month via Bank Account - Monthly
                                Salary&rdquo;
                            </li>
                        </ul>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Describe your transaction..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isProcessing}
                            />
                            <Button
                                type="submit"
                                disabled={isProcessing || !prompt.trim()}
                            >
                                {isProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        {error && (
                            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}
                        {result && (
                            <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600">
                                {result}
                            </div>
                        )}
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
