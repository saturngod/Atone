import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import transactions from '@/routes/transactions';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

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

export default function TransactionsIndex({
    transactions: transactionsList,
    accounts,
    categories,
}: PageProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] =
        useState<Transaction | null>(null);

    const editForm = useForm({
        account_id: '',
        category_id: '',
        amount: '',
        description: '',
        date: '',
    });

    const deleteForm = useForm({});

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />
            <div className="container mx-auto max-w-5xl py-10">
                <h1 className="mb-6 text-3xl font-bold">Transactions</h1>

                <TransactionForm accounts={accounts} categories={categories} />

                <TransactionList
                    transactions={transactionsList}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={handleDialogChange}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Transaction</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
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
                                        editForm.setData('date', e.target.value)
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
                                    onClick={() => setIsEditDialogOpen(false)}
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
    );
}
