import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import accounts from '@/routes/accounts';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Account {
    id: number;
    name: string;
    color: string;
}

interface PageProps {
    accounts: Account[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Accounts',
        href: accounts.index().url,
    },
];

export default function AccountsIndex({ accounts: accountsList }: PageProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);

    const form = useForm({
        name: '',
        color: '#3b82f6',
    });

    const deleteForm = useForm({});

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
        form.setData({ name: account.name, color: account.color });
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
            <div className="container mx-auto max-w-4xl px-4 py-10 md:px-0">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Accounts</h1>
                    <Dialog
                        open={isDialogOpen}
                        onOpenChange={handleDialogChange}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingAccount
                                        ? 'Edit Account'
                                        : 'Create Account'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium">
                                        Name
                                    </label>
                                    <Input
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        placeholder="e.g., Wallet, Bank"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">
                                        Color
                                    </label>
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
                                            className="h-10 w-12 p-1"
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
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
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

                {accountsList.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-muted-foreground">
                            No accounts yet. Create your first account!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {accountsList.map((account) => (
                            <Card key={account.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {account.name}
                                    </CardTitle>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(account)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDelete(account.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Badge
                                        style={{
                                            backgroundColor: account.color,
                                        }}
                                    >
                                        {account.color}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
