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
import AppLayout from '@/layouts/app-layout';
import merchants from '@/routes/merchants';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search, Store, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Merchant {
    id: number;
    name: string;
}

interface PageProps {
    merchants: Merchant[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Merchants',
        href: merchants.index().url,
    },
];

export default function MerchantsIndex({
    merchants: merchantsList,
}: PageProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(
        null,
    );
    const [searchQuery, setSearchQuery] = useState('');

    const form = useForm({
        name: '',
    });

    const deleteForm = useForm({});

    const filteredMerchants = useMemo(() => {
        if (!searchQuery.trim()) return merchantsList;
        const query = searchQuery.toLowerCase();
        return merchantsList.filter((merchant) =>
            merchant.name.toLowerCase().includes(query),
        );
    }, [merchantsList, searchQuery]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMerchant) {
            form.put(`/merchants/${editingMerchant.id}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setEditingMerchant(null);
                    form.reset();
                },
            });
        } else {
            form.post('/merchants', {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleEdit = (merchant: Merchant) => {
        setEditingMerchant(merchant);
        form.setData({ name: merchant.name });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this merchant?')) {
            deleteForm.delete(`/merchants/${id}`);
        }
    };

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingMerchant(null);
            form.reset();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Merchants" />
            <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Merchants
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Track where you spend your money
                        </p>
                    </div>
                    <Dialog
                        open={isDialogOpen}
                        onOpenChange={handleDialogChange}
                    >
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Merchant
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <div className="rounded-lg bg-cyan-500/10 p-2">
                                        <Store className="h-4 w-4 text-cyan-600" />
                                    </div>
                                    {editingMerchant
                                        ? 'Edit Merchant'
                                        : 'Create Merchant'}
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
                                        placeholder="e.g., Amazon, Starbucks"
                                        required
                                    />
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
                                        {editingMerchant ? 'Update' : 'Create'}
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
                            <div className="rounded-lg bg-cyan-500/10 p-3">
                                <Store className="h-5 w-5 text-cyan-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Merchants
                                </p>
                                <p className="text-2xl font-bold">
                                    {merchantsList.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {merchantsList.length > 0 && (
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search merchants..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    )}
                </div>

                {/* Merchants Grid */}
                {merchantsList.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
                        <div className="rounded-full bg-muted p-3">
                            <Store className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="mt-3 font-medium text-muted-foreground">
                            No merchants yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Add merchants to track your spending by store!
                        </p>
                    </div>
                ) : filteredMerchants.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
                        <div className="rounded-full bg-muted p-3">
                            <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="mt-3 font-medium text-muted-foreground">
                            No merchants found
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Try a different search term
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredMerchants.map((merchant) => (
                            <Card
                                key={merchant.id}
                                className="group transition-shadow hover:shadow-md"
                            >
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                                            <Store className="h-5 w-5 text-cyan-600" />
                                        </div>
                                        <span className="font-medium">
                                            {merchant.name}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleEdit(merchant)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() =>
                                                handleDelete(merchant.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
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
