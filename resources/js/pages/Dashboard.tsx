import { AIChatDialog, AIChatFAB } from '@/components/ai-chat-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { useTimezone } from '@/hooks/use-timezone';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Bot, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';

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

interface AccountSummary {
    name: string;
    color: string;
    income: string | number;
    expense: string | number;
}

interface CategorySummary {
    name: string;
    total: string | number;
}

interface TrendData {
    date: string;
    income: string | number;
    expense: string | number;
}

interface PageProps {
    totalBalance: number;
    today: { income: string | number; expense: string | number };
    thisMonth: { income: string | number; expense: string | number };
    thisYear: { income: string | number; expense: string | number };
    byAccount: AccountSummary[];
    byCategory: CategorySummary[];
    trend: TrendData[];
    recentTransactions: Transaction[];
}

const chartConfig = {
    income: {
        label: 'Income',
        color: 'hsl(142, 76%, 36%)',
    },
    expense: {
        label: 'Expense',
        color: 'hsl(0, 84%, 60%)',
    },
};

function toNumber(value: string | number): number {
    return typeof value === 'string' ? parseFloat(value) : value;
}

function formatCurrency(amount: string | number): string {
    return toNumber(amount).toFixed(2);
}

function formatAmount(amount: string | number): string {
    const num = toNumber(amount);
    const sign = num >= 0 ? '+' : '-';
    return `${sign}$${formatCurrency(Math.abs(num))}`;
}

function isIncome(amount: string | number): boolean {
    return toNumber(amount) >= 0;
}

function formatDateForDisplay(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
        timeZone: undefined,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard({
    totalBalance,
    thisMonth,
    thisYear,
    byAccount,
    byCategory,
    trend,
    recentTransactions,
}: PageProps) {
    const timezone = useTimezone();

    function formatDateForDisplay(dateStr: string): string {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', {
            timeZone: timezone,
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    const chartData = trend.map((item) => ({
        date: new Date(item.date + 'T00:00:00').toLocaleDateString('en-US', {
            timeZone: timezone,
            month: 'short',
            day: 'numeric',
        }),
        income: toNumber(item.income),
        expense: toNumber(item.expense),
    }));

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="container mx-auto max-w-5xl px-4 py-10 md:px-0">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <AIChatDialog>
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden md:flex"
                            >
                                <Bot className="mr-2 h-4 w-4" />
                                AI Assistant
                            </Button>
                        </AIChatDialog>
                    </div>

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
                                    This Month
                                </CardTitle>
                                <div className="flex gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg">
                                    <span className="text-green-600">
                                        +${formatCurrency(thisMonth.income)}
                                    </span>
                                    <span className="mx-2 text-muted-foreground">
                                        /
                                    </span>
                                    <span className="text-red-600">
                                        -${formatCurrency(thisMonth.expense)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Income / Expense
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    This Year
                                </CardTitle>
                                <div className="flex gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg">
                                    <span className="text-green-600">
                                        +${formatCurrency(thisYear.income)}
                                    </span>
                                    <span className="mx-2 text-muted-foreground">
                                        /
                                    </span>
                                    <span className="text-red-600">
                                        -${formatCurrency(thisYear.expense)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Income / Expense
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {chartData.length > 0 && (
                        <div className="mt-8">
                            <h2 className="mb-4 text-xl font-semibold">
                                30-Day Trend
                            </h2>
                            <Card>
                                <CardContent className="pt-6">
                                    <ChartContainer
                                        config={chartConfig}
                                        className="h-[300px] w-full"
                                    >
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient
                                                    id="incomeGradient"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="hsl(142, 76%, 36%)"
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="hsl(142, 76%, 36%)"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                                <linearGradient
                                                    id="expenseGradient"
                                                    x1="0"
                                                    y1="0"
                                                    x2="0"
                                                    y2="1"
                                                >
                                                    <stop
                                                        offset="5%"
                                                        stopColor="hsl(0, 84%, 60%)"
                                                        stopOpacity={0.3}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="hsl(0, 84%, 60%)"
                                                        stopOpacity={0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <XAxis
                                                dataKey="date"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 12 }}
                                                tickMargin={8}
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 12 }}
                                                tickMargin={8}
                                                tickFormatter={(value) =>
                                                    `$${value}`
                                                }
                                            />
                                            <ChartTooltip
                                                content={
                                                    <ChartTooltipContent
                                                        formatter={(
                                                            value,
                                                            name,
                                                        ) => [
                                                            `$${Number(value).toFixed(2)}`,
                                                            name === 'income'
                                                                ? 'Income'
                                                                : 'Expense',
                                                        ]}
                                                    />
                                                }
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="income"
                                                stroke="hsl(142, 76%, 36%)"
                                                fill="url(#incomeGradient)"
                                                strokeWidth={2}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="expense"
                                                stroke="hsl(0, 84%, 60%)"
                                                fill="url(#expenseGradient)"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <div>
                            <h2 className="mb-4 text-xl font-semibold">
                                By Account (This Month)
                            </h2>
                            {byAccount.length === 0 ? (
                                <div className="rounded-lg border bg-card p-6 text-center">
                                    <p className="text-muted-foreground">
                                        No data yet
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {byAccount.map((account, index) => (
                                        <Card key={index}>
                                            <CardContent className="flex items-center justify-between p-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                account.color,
                                                        }}
                                                    />
                                                    <span className="font-medium">
                                                        {account.name}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-green-600">
                                                        +$
                                                        {formatCurrency(
                                                            account.income,
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-red-600">
                                                        -$
                                                        {formatCurrency(
                                                            account.expense,
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="mb-4 text-xl font-semibold">
                                By Category (This Month)
                            </h2>
                            {byCategory.length === 0 ? (
                                <div className="rounded-lg border bg-card p-6 text-center">
                                    <p className="text-muted-foreground">
                                        No data yet
                                    </p>
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="space-y-3">
                                            {byCategory.map(
                                                (category, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <span>
                                                            {category.name}
                                                        </span>
                                                        <span className="font-medium">
                                                            $
                                                            {formatCurrency(
                                                                category.total,
                                                            )}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
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
                                                                transaction
                                                                    .category
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
                                                                    .account
                                                                    .color,
                                                            }}
                                                        >
                                                            {
                                                                transaction
                                                                    .account
                                                                    .name
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                                {transaction.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            transaction.description
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`font-semibold ${
                                                        isIncome(
                                                            transaction.amount,
                                                        )
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                    }`}
                                                >
                                                    {formatAmount(
                                                        transaction.amount,
                                                    )}
                                                </span>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateForDisplay(
                                                        transaction.date,
                                                    )}
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
            <AIChatFAB />
        </>
    );
}
