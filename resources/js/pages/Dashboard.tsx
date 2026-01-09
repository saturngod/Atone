import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTimezone } from '@/hooks/use-timezone';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    Layers,
    RefreshCw,
    Store,
    TrendingUp,
    Wallet,
} from 'lucide-react';
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

interface MerchantSummary {
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
    byMerchant: MerchantSummary[];
    trend: TrendData[];
    recentTransactions: Transaction[];
    currency: string;
    availableCurrencies: string[];
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
    byMerchant,
    trend,
    recentTransactions,
    currency,
    availableCurrencies,
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

    const chartData = trend.map((item) => {
        // Parse the date and extract year, month, day to avoid timezone shifts
        // The backend returns dates as strings in format "Y-m-d H:i:s" or "Y-m-d"
        const dateStr = String(item.date);
        const datePart = dateStr.includes(' ')
            ? dateStr.split(' ')[0]
            : dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);

        // Create date in local timezone at noon to avoid DST issues
        const date = new Date(year, month - 1, day, 12, 0, 0);

        return {
            date: date.toLocaleDateString('en-US', {
                timeZone: timezone,
                month: 'short',
                day: 'numeric',
            }),
            income: toNumber(item.income),
            expense: toNumber(item.expense),
        };
    });

    // Calculate net flow for the month
    const monthlyNet = toNumber(thisMonth.income) - toNumber(thisMonth.expense);
    const isPositiveNet = monthlyNet >= 0;

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Dashboard" />
                <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Dashboard
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Your financial overview at a glance
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => router.reload()}
                                title="Refresh"
                                className="shrink-0"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Select
                                value={currency}
                                onValueChange={(value) =>
                                    router.visit(dashboard().url, {
                                        data: { currency: value },
                                        preserveState: true,
                                        preserveScroll: true,
                                        replace: true,
                                    })
                                }
                            >
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCurrencies.map((c) => (
                                        <SelectItem key={c} value={c}>
                                            {c}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Balance Card - Featured */}
                        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent sm:col-span-2 lg:col-span-1">
                            <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-2xl" />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Balance
                                </CardTitle>
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <Wallet className="h-4 w-4 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold tracking-tight">
                                    ${formatCurrency(totalBalance)}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Across all accounts
                                </p>
                            </CardContent>
                        </Card>

                        {/* Monthly Net Flow */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Monthly Net Flow
                                </CardTitle>
                                <div
                                    className={`rounded-lg p-2 ${isPositiveNet ? 'bg-green-500/10' : 'bg-red-500/10'}`}
                                >
                                    {isPositiveNet ? (
                                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-2xl font-bold ${isPositiveNet ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {isPositiveNet ? '+' : '-'}$
                                    {formatCurrency(Math.abs(monthlyNet))}
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Income minus expenses
                                </p>
                            </CardContent>
                        </Card>

                        {/* This Month */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    This Month
                                </CardTitle>
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-semibold text-green-600">
                                        +${formatCurrency(thisMonth.income)}
                                    </span>
                                    <span className="text-muted-foreground">
                                        /
                                    </span>
                                    <span className="text-lg font-semibold text-red-600">
                                        -${formatCurrency(thisMonth.expense)}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Income / Expense
                                </p>
                            </CardContent>
                        </Card>

                        {/* This Year */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    This Year
                                </CardTitle>
                                <div className="rounded-lg bg-purple-500/10 p-2">
                                    <Layers className="h-4 w-4 text-purple-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-semibold text-green-600">
                                        +${formatCurrency(thisYear.income)}
                                    </span>
                                    <span className="text-muted-foreground">
                                        /
                                    </span>
                                    <span className="text-lg font-semibold text-red-600">
                                        -${formatCurrency(thisYear.expense)}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Income / Expense
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Trend Chart */}
                    {chartData.length > 0 && (
                        <div className="mt-8">
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-semibold">
                                                30-Day Trend
                                            </CardTitle>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Income vs Expense over time
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                                <span className="text-sm text-muted-foreground">
                                                    Income
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                                <span className="text-sm text-muted-foreground">
                                                    Expense
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-6">
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

                    {/* Breakdown Section */}
                    <div className="mt-8 grid gap-6 lg:grid-cols-3">
                        {/* By Account */}
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <CreditCard className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold">
                                            By Account
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            This month
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-6">
                                {byAccount.length === 0 ? (
                                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
                                        <p className="text-sm text-muted-foreground">
                                            No data yet
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {byAccount.map((account, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-3 w-3 rounded-full ring-2 ring-offset-2 ring-offset-background"
                                                        style={{
                                                            backgroundColor:
                                                                account.color,
                                                        }}
                                                    />
                                                    <span className="font-medium">
                                                        {account.name}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end gap-0.5">
                                                    <span className="text-sm font-medium text-green-600">
                                                        +$
                                                        {formatCurrency(
                                                            account.income,
                                                        )}
                                                    </span>
                                                    <span className="text-sm font-medium text-red-600">
                                                        -$
                                                        {formatCurrency(
                                                            account.expense,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* By Category */}
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-orange-500/10 p-2">
                                        <Layers className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold">
                                            By Category
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            This month
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-6">
                                {byCategory.length === 0 ? (
                                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
                                        <p className="text-sm text-muted-foreground">
                                            No data yet
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {byCategory.map((category, index) => {
                                            const maxTotal = Math.max(
                                                ...byCategory.map((c) =>
                                                    Math.abs(toNumber(c.total)),
                                                ),
                                            );
                                            const percentage =
                                                (Math.abs(
                                                    toNumber(category.total),
                                                ) /
                                                    maxTotal) *
                                                100;
                                            return (
                                                <div
                                                    key={index}
                                                    className="space-y-1"
                                                >
                                                    <div className="flex items-center justify-between text-sm">
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
                                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* By Merchant */}
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-cyan-500/10 p-2">
                                        <Store className="h-4 w-4 text-cyan-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold">
                                            By Merchant
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            This month
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-6">
                                {byMerchant.length === 0 ? (
                                    <div className="flex h-24 items-center justify-center rounded-lg border border-dashed">
                                        <p className="text-sm text-muted-foreground">
                                            No data yet
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {byMerchant.map((merchant, index) => {
                                            const maxTotal = Math.max(
                                                ...byMerchant.map((m) =>
                                                    Math.abs(toNumber(m.total)),
                                                ),
                                            );
                                            const percentage =
                                                (Math.abs(
                                                    toNumber(merchant.total),
                                                ) /
                                                    maxTotal) *
                                                100;
                                            return (
                                                <div
                                                    key={index}
                                                    className="space-y-1"
                                                >
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span>
                                                            {merchant.name}
                                                        </span>
                                                        <span className="font-medium">
                                                            $
                                                            {formatCurrency(
                                                                merchant.total,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all"
                                                            style={{
                                                                width: `${percentage}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Transactions */}
                    <div className="mt-8">
                        <Card>
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-semibold">
                                            Recent Transactions
                                        </CardTitle>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Your latest financial activity
                                        </p>
                                    </div>
                                    <Link href="/transactions">
                                        <Button variant="ghost" size="sm">
                                            View all
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-6">
                                {recentTransactions.length === 0 ? (
                                    <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed">
                                        <p className="text-muted-foreground">
                                            No transactions yet
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Start tracking your finances!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {recentTransactions.map(
                                            (transaction) => (
                                                <div
                                                    key={transaction.id}
                                                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                                isIncome(
                                                                    transaction.amount,
                                                                )
                                                                    ? 'bg-green-500/10'
                                                                    : 'bg-red-500/10'
                                                            }`}
                                                        >
                                                            {isIncome(
                                                                transaction.amount,
                                                            ) ? (
                                                                <ArrowUpRight className="h-5 w-5 text-green-600" />
                                                            ) : (
                                                                <ArrowDownRight className="h-5 w-5 text-red-600" />
                                                            )}
                                                        </div>
                                                        <div>
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
                                                                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                                                                        style={{
                                                                            backgroundColor:
                                                                                transaction
                                                                                    .account
                                                                                    .color +
                                                                                '15',
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
                                                                <p className="mt-0.5 text-sm text-muted-foreground">
                                                                    {
                                                                        transaction.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span
                                                            className={`text-lg font-semibold ${
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
                                            ),
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
