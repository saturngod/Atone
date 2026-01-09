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
import merchants from '@/routes/merchants';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

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

    const form = useForm({
        name: '',
    });

    const deleteForm = useForm({});

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
            <div className="container mx-auto max-w-4xl px-4 py-10 md:px-0">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Merchants</h1>
                    <Dialog
                        open={isDialogOpen}
                        onOpenChange={handleDialogChange}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Merchant
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingMerchant
                                        ? 'Edit Merchant'
                                        : 'Create Merchant'}
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
                                        placeholder="e.g., Amazon, Starbucks"
                                        required
                                    />
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
                                        {editingMerchant ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {merchantsList.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-muted-foreground">
                            No merchants yet. Create your first merchant!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {merchantsList.map((merchant) => (
                            <Card key={merchant.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {merchant.name}
                                    </CardTitle>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(merchant)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDelete(merchant.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Edit or delete this merchant
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
