import TransactionForm from '@/components/TransactionForm';
import { AIChatDialog, AIChatFAB } from '@/components/ai-chat-dialog';
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
import AppLayout from '@/layouts/app-layout';
import transactions from '@/routes/transactions';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Bot, Pencil, Search, Trash2, X } from 'lucide-react';
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

interface PageProps {
    transactions: Transaction[];
    accounts: Account[];
    categories: Category[];
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
    return `${sign}$${num.toFixed(2)}`;
}

function isIncome(amount: string | number): boolean {
    return toNumber(amount) >= 0;
}

export default function TransactionsIndex({
    transactions: transactionsList,
    accounts,
    categories,
}: PageProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] =
        useState<Transaction | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const editForm = useForm({
        account_id: '',
        category_id: '',
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
                transaction.account?.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase());

            const transactionDate = new Date(transaction.date);
            const matchesDateFrom =
                !dateFrom || transactionDate >= new Date(dateFrom);
            const matchesDateTo =
                !dateTo || transactionDate <= new Date(dateTo);

            const matchesCategory =
                categoryFilter === 'all' ||
                transaction.category?.id.toString() === categoryFilter;

            return (
                matchesSearch &&
                matchesDateFrom &&
                matchesDateTo &&
                matchesCategory
            );
        });
    }, [transactionsList, searchQuery, dateFrom, dateTo, categoryFilter]);

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        editForm.setData({
            account_id: transaction.account?.id.toString() || '',
            category_id: transaction.category?.id.toString() || '',
            amount: transaction.amount.toString(),
            description: transaction.description || '',
            date: transaction.date,
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
        setCategoryFilter('all');
    };

    const hasActiveFilters =
        searchQuery || dateFrom || dateTo || categoryFilter;

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Transactions" />
                <div className="container mx-auto max-w-6xl px-4 py-10 md:px-0">
                    <div className="mb-6 flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Transactions</h1>
                        <AIChatDialog>
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden md:flex"
                            >
                                <Bot className="mr-2 h-4 w-4" />
                                Add with AI
                            </Button>
                        </AIChatDialog>
                    </div>

                    <TransactionForm
                        accounts={accounts}
                        categories={categories}
                    />

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                All Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div className="flex flex-1 gap-2">
                                    <div className="relative flex-1 md:max-w-xs">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search description..."
                                            value={searchQuery}
                                            onChange={(e) =>
                                                setSearchQuery(e.target.value)
                                            }
                                            className="pl-9"
                                        />
                                    </div>
                                    <Input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) =>
                                            setDateFrom(e.target.value)
                                        }
                                        className="w-auto"
                                        placeholder="From"
                                    />
                                    <span className="flex items-center text-muted-foreground">
                                        -
                                    </span>
                                    <Input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) =>
                                            setDateTo(e.target.value)
                                        }
                                        className="w-auto"
                                        placeholder="To"
                                    />
                                    <Select
                                        value={categoryFilter}
                                        onValueChange={setCategoryFilter}
                                    >
                                        <SelectTrigger className="w-[180px]">
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
                                </div>
                                {hasActiveFilters && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Clear Filters
                                    </Button>
                                )}
                            </div>

                            {filteredTransactions.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    {hasActiveFilters
                                        ? 'No transactions match your filters.'
                                        : 'No transactions yet. Add your first transaction above!'}
                                </div>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[120px]">
                                                    Date
                                                </TableHead>
                                                <TableHead>
                                                    Description
                                                </TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Account</TableHead>
                                                <TableHead className="text-right">
                                                    Amount
                                                </TableHead>
                                                <TableHead className="w-[100px]">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredTransactions.map(
                                                (transaction) => (
                                                    <TableRow
                                                        key={transaction.id}
                                                    >
                                                        <TableCell className="whitespace-nowrap">
                                                            {new Date(
                                                                transaction.date,
                                                            ).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            {transaction.description || (
                                                                <span className="text-muted-foreground">
                                                                    —
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
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
                                                                    —
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {transaction.account ? (
                                                                <span
                                                                    className="rounded px-2 py-0.5 text-xs"
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
                                                            ) : (
                                                                <span className="text-muted-foreground">
                                                                    —
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell
                                                            className={`text-right font-medium ${
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
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
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

                            <div className="mt-2 text-sm text-muted-foreground">
                                Showing {filteredTransactions.length} of{' '}
                                {transactionsList.length} transactions
                            </div>
                        </CardContent>
                    </Card>

                    <Dialog
                        open={isEditDialogOpen}
                        onOpenChange={handleDialogChange}
                    >
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Transaction</DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={handleEditSubmit}
                                className="space-y-4"
                            >
                                <div>
                                    <Label htmlFor="edit-amount">Amount</Label>
                                    <div className="relative">
                                        <span
                                            className="absolute left-3 text-muted-foreground"
                                            style={{ top: 5 }}
                                        >
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

                                <div>
                                    <Label>Category</Label>
                                    <select
                                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        value={editForm.data.category_id}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'category_id',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    >
                                        <option value="">Select...</option>
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label>Account</Label>
                                    <select
                                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                        value={editForm.data.account_id}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'account_id',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    >
                                        <option value="">Select...</option>
                                        {accounts.map((account) => (
                                            <option
                                                key={account.id}
                                                value={account.id}
                                            >
                                                {account.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="edit-date">Date</Label>
                                    <Input
                                        id="edit-date"
                                        type="date"
                                        className="mt-1"
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

                                <div>
                                    <Label htmlFor="edit-description">
                                        Description
                                    </Label>
                                    <Input
                                        id="edit-description"
                                        placeholder="Optional..."
                                        className="mt-1"
                                        value={editForm.data.description}
                                        onChange={(e) =>
                                            editForm.setData(
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
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
            <AIChatFAB />
        </>
    );
}
