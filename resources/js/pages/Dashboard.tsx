import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

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

function formatCurrency(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(2);
}

interface PageProps {
    totalBalance: number;
    currentMonthIncome: number;
    currentMonthExpenses: number;
    recentTransactions: Transaction[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({
    totalBalance,
    currentMonthIncome,
    currentMonthExpenses,
    recentTransactions,
}: PageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="container mx-auto max-w-5xl py-10">
                <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Balance
                            </CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${formatCurrency(totalBalance)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Across all accounts
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                This Month Income
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                +${formatCurrency(currentMonthIncome)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Current month earnings
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                This Month Expenses
                            </CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                -${formatCurrency(currentMonthExpenses)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Current month spending
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8">
                    <h2 className="mb-4 text-xl font-semibold">
                        Recent Transactions
                    </h2>
                    {recentTransactions.length === 0 ? (
                        <div className="rounded-lg border bg-card p-6 text-center">
                            <p className="text-muted-foreground">
                                No transactions yet. Start tracking your
                                finances!
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-lg border bg-card">
                            <div className="divide-y">
                                {recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {transaction.category ? (
                                                    <span className="font-medium">
                                                        {
                                                            transaction.category
                                                                .name
                                                        }
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">
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
                                                <p className="text-sm text-muted-foreground">
                                                    {transaction.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
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
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                    transaction.date,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
