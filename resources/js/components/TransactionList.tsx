import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Trash2 } from 'lucide-react';

interface Transaction {
    id: number;
    amount: string | number;
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

interface TransactionListProps {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (id: number) => void;
}

function getDateGroup(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }

    const diffDays = Math.floor(
        (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 7) {
        return 'Last 7 Days';
    }

    return 'Older';
}

function formatAmount(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formatted = Math.abs(num).toFixed(2);
    const sign = num >= 0 ? '+' : '-';
    return `${sign}$${formatted}`;
}

function isIncome(amount: string | number): boolean {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num >= 0;
}

export default function TransactionList({
    transactions,
    onEdit,
    onDelete,
}: TransactionListProps) {
    const groupedTransactions = transactions.reduce(
        (groups: Record<string, Transaction[]>, transaction: Transaction) => {
            const groupKey = getDateGroup(transaction.date);
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(transaction);
            return groups;
        },
        {},
    );

    const groupOrder = ['Today', 'Yesterday', 'Last 7 Days', 'Older'];

    if (transactions.length === 0) {
        return (
            <div className="py-10 text-center">
                <p className="text-muted-foreground">
                    No transactions yet. Add your first transaction above!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {groupOrder.map((group) => {
                const groupTransactions = groupedTransactions[group];
                if (!groupTransactions) return null;

                return (
                    <div key={group}>
                        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                            {group}
                        </h3>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {groupTransactions.map((transaction) => (
                                <Card key={transaction.id}>
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {transaction.category ? (
                                                    <span className="text-sm font-medium">
                                                        {
                                                            transaction.category
                                                                .name
                                                        }
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        Uncategorized
                                                    </span>
                                                )}
                                                {transaction.account && (
                                                    <span
                                                        className="rounded px-1.5 py-0.5 text-xs"
                                                        style={{
                                                            backgroundColor:
                                                                transaction
                                                                    .account
                                                                    .color +
                                                                '20',
                                                            color: transaction
                                                                .account.color,
                                                        }}
                                                    >
                                                        {
                                                            transaction.account
                                                                .name
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                            {transaction.description && (
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {transaction.description}
                                                </p>
                                            )}
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {new Date(
                                                    transaction.date,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`font-semibold ${
                                                    isIncome(transaction.amount)
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }`}
                                            >
                                                {formatAmount(
                                                    transaction.amount,
                                                )}
                                            </span>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        onEdit(transaction)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        onDelete(transaction.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
