import TransactionForm from '@/components/TransactionForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useTimezone } from '@/hooks/use-timezone';
import AppLayout from '@/layouts/app-layout';
import transactions from '@/routes/transactions';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    Filter,
    Pencil,
    Receipt,
    RefreshCw,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface Account {
    id: number;
    name: string;
    color: string;
}

interface Category {
    id: number;
    name: string;
}

interface Merchant {
    id: number;
    name: string;
}

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
    merchant: {
        id: number;
        name: string;
    } | null;
}

interface PageProps {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
    merchants: Merchant[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Transactions',
        href: transactions.index().url,
    },
];

function toNumber(value: string | number): number {
    return typeof value === 'string' ? parseFloat(value) : value;
}

function formatAmount(amount: string | number): string {
    const num = toNumber(amount);
    const sign = num >= 0 ? '+' : '-';
    return `${sign}$${Math.abs(num).toFixed(2)}`;
}

function isIncome(amount: string | number): boolean {
    return toNumber(amount) >= 0;
}

export default function TransactionsIndex({
    transactions: transactionsList,
    accounts,
    categories,
    merchants,
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

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] =
        useState<Transaction | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [accountFilter, setAccountFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [merchantFilter, setMerchantFilter] = useState('all');

    const editForm = useForm({
        account_id: '',
        category_id: '',
        merchant_name: '',
        amount: '',
        description: '',
        date: '',
    });

    const deleteForm = useForm({});

    const filteredTransactions = useMemo(() => {
        return transactionsList.filter((transaction) => {
            const matchesSearch =
                !searchQuery ||
                transaction.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                transaction.category?.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                transaction.merchant?.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                transaction.account?.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());

            const transactionDate = new Date(transaction.date);
            const matchesDateFrom =
                !dateFrom || transactionDate >= new Date(dateFrom);
            const matchesDateTo =
                !dateTo || transactionDate <= new Date(dateTo);

            const matchesAccount =
                accountFilter === 'all' ||
                transaction.account?.id.toString() === accountFilter;

            const matchesCategory =
                categoryFilter === 'all' ||
                transaction.category?.id.toString() === categoryFilter;

            const matchesMerchant =
                merchantFilter === 'all' ||
                transaction.merchant?.id.toString() === merchantFilter;

            return (
                matchesSearch &&
                matchesDateFrom &&
                matchesDateTo &&
                matchesAccount &&
                matchesCategory &&
                matchesMerchant
            );
        });
    }, [
        transactionsList,
        searchQuery,
        dateFrom,
        dateTo,
        accountFilter,
        categoryFilter,
        merchantFilter,
    ]);

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        const totalIncome = filteredTransactions
            .filter((t) => toNumber(t.amount) >= 0)
            .reduce((sum, t) => sum + toNumber(t.amount), 0);
        const totalExpense = filteredTransactions
            .filter((t) => toNumber(t.amount) < 0)
            .reduce((sum, t) => sum + Math.abs(toNumber(t.amount)), 0);
        return { totalIncome, totalExpense };
    }, [filteredTransactions]);

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        const dateValue = transaction.date
            ? new Date(transaction.date).toISOString().split('T')[0]
            : '';
        editForm.setData({
            account_id: transaction.account?.id.toString() || '',
            category_id: transaction.category?.id.toString() || '',
            merchant_name: transaction.merchant?.name || '',
            amount: transaction.amount.toString(),
            description: transaction.description || '',
            date: dateValue,
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            deleteForm.delete(`/transactions/${id}`);
        }
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTransaction) {
            editForm.put(`/transactions/${editingTransaction.id}`, {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    setEditingTransaction(null);
                },
            });
        }
    };

    const handleDialogChange = (open: boolean) => {
        setIsEditDialogOpen(open);
        if (!open) {
            setEditingTransaction(null);
            editForm.reset();
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setDateFrom('');
        setDateTo('');
        setAccountFilter('all');
        setCategoryFilter('all');
        setMerchantFilter('all');
    };

    const hasActiveFilters =
        searchQuery ||
        dateFrom ||
        dateTo ||
        accountFilter !== 'all' ||
        categoryFilter !== 'all' ||
        merchantFilter !== 'all';

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Transactions" />
                <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Transactions
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Manage and track your financial activity
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.reload()}
                            title="Refresh"
                            className="shrink-0"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Transaction Form */}
                    <TransactionForm
                        accounts={accounts}
                        categories={categories}
                        merchants={merchants}
                    />

                    {/* Summary Stats */}
                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                        <Card>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="rounded-lg bg-primary/10 p-3">
                                    <Receipt className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Transactions
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {filteredTransactions.length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="rounded-lg bg-green-500/10 p-3">
                                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Income
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">
                                        +${summaryStats.totalIncome.toFixed(2)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="rounded-lg bg-red-500/10 p-3">
                                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Expenses
                                    </p>
                                    <p className="text-2xl font-bold text-red-600">
                                        -${summaryStats.totalExpense.toFixed(2)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transactions Table Card */}
                    <Card className="mt-6">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Receipt className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold">
                                            All Transactions
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {filteredTransactions.length} of{' '}
                                            {transactionsList.length} shown
                                        </p>
                                    </div>
                                </div>
                                {hasActiveFilters && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                        className="gap-2"
                                    >
                                        <X className="h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pb-6">
                            {/* Filters */}
                            <div className="mb-6 rounded-lg border bg-muted/30 p-4">
                                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Filter className="h-4 w-4" />
                                    Filters
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                                    {/* Search - takes full width on mobile, 2 cols on lg */}
                                    <div className="relative sm:col-span-2 lg:col-span-2">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search transactions..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="bg-background pl-9"
                                        />
                                    </div>
                                    {/* Date From */}
                                    <div className="flex items-center gap-2 rounded-lg border bg-background p-2">
                                        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) =>
                                                setDateFrom(e.target.value)
                                            }
                                            className="h-auto w-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                                            placeholder="From"
                                        />
                                    </div>
                                    {/* Date To */}
                                    <div className="flex items-center gap-2 rounded-lg border bg-background p-2">
                                        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <Input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) =>
                                                setDateTo(e.target.value)
                                            }
                                            className="h-auto w-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                                            placeholder="To"
                                        />
                                    </div>
                                    {/* Account Filter */}
                                    <Select
                                        value={accountFilter}
                                        onValueChange={setAccountFilter}
                                    >
                                        <SelectTrigger className="w-full bg-background">
                                            <SelectValue placeholder="All Accounts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Accounts
                                            </SelectItem>
                                            {accounts.map((account) => (
                                                <SelectItem
                                                    key={account.id}
                                                    value={account.id.toString()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-2 w-2 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    account.color,
                                                            }}
                                                        />
                                                        {account.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {/* Category Filter */}
                                    <Select
                                        value={categoryFilter}
                                        onValueChange={setCategoryFilter}
                                    >
                                        <SelectTrigger className="w-full bg-background">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Categories
                                            </SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id.toString()}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {/* Merchant Filter */}
                                    <Select
                                        value={merchantFilter}
                                        onValueChange={setMerchantFilter}
                                    >
                                        <SelectTrigger className="w-full bg-background">
                                            <SelectValue placeholder="All Merchants" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Merchants
                                            </SelectItem>
                                            {merchants.map((merchant) => (
                                                <SelectItem
                                                    key={merchant.id}
                                                    value={merchant.id.toString()}
                                                >
                                                    {merchant.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Table */}
                            {filteredTransactions.length === 0 ? (
                                <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
                                    <div className="rounded-full bg-muted p-3">
                                        <Receipt className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <p className="mt-3 font-medium text-muted-foreground">
                                        {hasActiveFilters
                                            ? 'No transactions match your filters'
                                            : 'No transactions yet'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {hasActiveFilters
                                            ? 'Try adjusting your search criteria'
                                            : 'Add your first transaction above!'}
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-lg border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                                <TableHead className="w-[120px] font-semibold">
                                                    Date
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Description
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Category
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Merchant
                                                </TableHead>
                                                <TableHead className="font-semibold">
                                                    Account
                                                </TableHead>
                                                <TableHead className="text-right font-semibold">
                                                    Amount
                                                </TableHead>
                                                <TableHead className="w-[100px] text-center font-semibold">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredTransactions.map(
                                                (transaction) => (
                                                    <TableRow
                                                        key={transaction.id}
                                                        className="group"
                                                    >
                                                        <TableCell className="whitespace-nowrap text-muted-foreground">
                                                            {formatDateForDisplay(
                                                                transaction.date,
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
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
                                                                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                                                                    ) : (
                                                                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                                                                    )}
                                                                </div>
                                                                <span className="font-medium">
                                                                    {transaction.description || (
                                                                        <span className="text-muted-foreground">
                                                                            —
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {transaction.category ? (
                                                                <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                                                    {
                                                                        transaction
                                                                            .category
                                                                            .name
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">
                                                                    —
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {transaction.merchant ? (
                                                                <span className="text-sm">
                                                                    {
                                                                        transaction
                                                                            .merchant
                                                                            .name
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">
                                                                    —
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {transaction.account ? (
                                                                <span
                                                                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
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
                                                            ) : (
                                                                <span className="text-muted-foreground">
                                                                    —
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell
                                                            className={`text-right text-base font-semibold ${
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
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            transaction,
                                                                        )
                                                                    }
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            transaction.id,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Edit Dialog */}
                    <Dialog
                        open={isEditDialogOpen}
                        onOpenChange={handleDialogChange}
                    >
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <Pencil className="h-4 w-4 text-primary" />
                                    </div>
                                    Edit Transaction
                                </DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={handleEditSubmit}
                                className="mt-4 space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="edit-amount">Amount</Label>
                                    <div className="relative">
                                        <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
                                            $
                                        </span>
                                        <Input
                                            id="edit-amount"
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="pl-7"
                                            value={editForm.data.amount}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'amount',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Select
                                        value={editForm.data.category_id}
                                        onValueChange={(value) =>
                                            editForm.setData(
                                                'category_id',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id.toString()}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Merchant</Label>
                                    <Select
                                        value={
                                            editForm.data.merchant_name ||
                                            '__none__'
                                        }
                                        onValueChange={(value) =>
                                            editForm.setData(
                                                'merchant_name',
                                                value === '__none__'
                                                    ? ''
                                                    : value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select merchant (optional)..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">
                                                None
                                            </SelectItem>
                                            {merchants.map((merchant) => (
                                                <SelectItem
                                                    key={merchant.id}
                                                    value={merchant.name}
                                                >
                                                    {merchant.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Account</Label>
                                    <Select
                                        value={editForm.data.account_id}
                                        onValueChange={(value) =>
                                            editForm.setData(
                                                'account_id',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map((account) => (
                                                <SelectItem
                                                    key={account.id}
                                                    value={account.id.toString()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="h-2 w-2 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    account.color,
                                                            }}
                                                        />
                                                        {account.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-date">Date</Label>
                                    <Input
                                        id="edit-date"
                                        type="date"
                                        value={editForm.data.date}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'date',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-description">
                                        Description
                                    </Label>
                                    <Input
                                        id="edit-description"
                                        placeholder="Optional..."
                                        value={editForm.data.description}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            setIsEditDialogOpen(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={editForm.processing}
                                    >
                                        {editForm.processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </AppLayout>
        </>
    );
}
