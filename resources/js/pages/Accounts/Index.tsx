import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import AppLayout from '@/layouts/app-layout';
import accounts from '@/routes/accounts';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CreditCard, Pencil, Plus, Search, Trash2, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Account {
    id: number;
    name: string;
    color: string;
    currency_code: string;
}

interface PageProps {
    accounts: Account[];
    auth: {
        user: {
            currency_code: string;
        };
    };
    supported_currencies: string[];
    [key: string]: unknown;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accounts',
        href: accounts.index().url,
    },
];

export default function AccountsIndex({
    accounts: accountsList,
    supported_currencies,
}: PageProps) {
    const { auth } = usePage<PageProps>().props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const form = useForm({
        name: '',
        color: '#3b82f6',
        currency_code: auth.user.currency_code || 'USD',
    });

    const deleteForm = useForm({});

    const filteredAccounts = useMemo(() => {
        if (!searchQuery.trim()) return accountsList;
        const query = searchQuery.toLowerCase();
        return accountsList.filter(
            (account) =>
                account.name.toLowerCase().includes(query) ||
                account.currency_code.toLowerCase().includes(query),
        );
    }, [accountsList, searchQuery]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAccount) {
            form.put(`/accounts/${editingAccount.id}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setEditingAccount(null);
                    form.reset();
                },
            });
        } else {
            form.post('/accounts', {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleEdit = (account: Account) => {
        setEditingAccount(account);
        form.setData({
            name: account.name,
            color: account.color,
            currency_code: account.currency_code,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this account?')) {
            deleteForm.delete(`/accounts/${id}`);
        }
    };

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingAccount(null);
            form.reset();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Accounts" />
            <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Accounts
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Manage your financial accounts
                        </p>
                    </div>
                    <Dialog
                        open={isDialogOpen}
                        onOpenChange={handleDialogChange}
                    >
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <div className="rounded-lg bg-primary/10 p-2">
                                        <CreditCard className="h-4 w-4 text-primary" />
                                    </div>
                                    {editingAccount
                                        ? 'Edit Account'
                                        : 'Create Account'}
                                </DialogTitle>
                            </DialogHeader>
                            <form
                                onSubmit={handleSubmit}
                                className="mt-4 space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label>Name</Label>
                                    <Input
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        placeholder="e.g., Wallet, Bank"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Select
                                        value={form.data.currency_code}
                                        onValueChange={(value) =>
                                            form.setData('currency_code', value)
                                        }
                                        disabled={!!editingAccount}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {supported_currencies.map(
                                                (code) => (
                                                    <SelectItem
                                                        key={code}
                                                        value={code}
                                                    >
                                                        {code}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {editingAccount && (
                                        <p className="text-xs text-muted-foreground">
                                            Currency cannot be changed after
                                            creation.
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Color</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            value={form.data.color}
                                            onChange={(e) =>
                                                form.setData(
                                                    'color',
                                                    e.target.value,
                                                )
                                            }
                                            className="h-10 w-14 cursor-pointer p-1"
                                        />
                                        <Input
                                            value={form.data.color}
                                            onChange={(e) =>
                                                form.setData(
                                                    'color',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="#3b82f6"
                                            pattern="^#[0-9A-Fa-f]{6}$"
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        {editingAccount ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Summary and Search */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Card className="flex-shrink-0">
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <Wallet className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Accounts
                                </p>
                                <p className="text-2xl font-bold">
                                    {accountsList.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {accountsList.length > 0 && (
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search accounts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    )}
                </div>

                {/* Accounts Grid */}
                {accountsList.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
                        <div className="rounded-full bg-muted p-3">
                            <CreditCard className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="mt-3 font-medium text-muted-foreground">
                            No accounts yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Create your first account to get started!
                        </p>
                    </div>
                ) : filteredAccounts.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
                        <div className="rounded-full bg-muted p-3">
                            <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="mt-3 font-medium text-muted-foreground">
                            No accounts found
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Try a different search term
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredAccounts.map((account) => (
                            <Card
                                key={account.id}
                                className="group relative overflow-hidden transition-shadow hover:shadow-md"
                            >
                                <div
                                    className="absolute top-0 left-0 h-full w-1"
                                    style={{
                                        backgroundColor: account.color,
                                    }}
                                />
                                <CardContent className="p-4 pl-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-lg"
                                                style={{
                                                    backgroundColor:
                                                        account.color + '20',
                                                }}
                                            >
                                                <CreditCard
                                                    className="h-5 w-5"
                                                    style={{
                                                        color: account.color,
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">
                                                    {account.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {account.currency_code}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    handleEdit(account)
                                                }
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() =>
                                                    handleDelete(account.id)
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
                )}
            </div>
        </AppLayout>
    );
}
