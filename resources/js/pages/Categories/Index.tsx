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
import categories from '@/routes/categories';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    transactions_count?: number;
}

interface PageProps {
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: categories.index().url,
    },
];

export default function CategoriesIndex({
    categories: categoriesList,
}: PageProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );

    const form = useForm({
        name: '',
    });

    const deleteForm = useForm({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            form.put(`/categories/${editingCategory.id}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setEditingCategory(null);
                    form.reset();
                },
            });
        } else {
            form.post('/categories', {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    form.reset();
                },
            });
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        form.setData({ name: category.name });
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this category?')) {
            deleteForm.delete(`/categories/${id}`);
        }
    };

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            setEditingCategory(null);
            form.reset();
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="container mx-auto max-w-4xl px-4 py-10 md:px-0">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Categories</h1>
                    <Dialog
                        open={isDialogOpen}
                        onOpenChange={handleDialogChange}
                    >
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingCategory
                                        ? 'Edit Category'
                                        : 'Create Category'}
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
                                        placeholder="e.g., Food, Transport"
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
                                        {editingCategory ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {categoriesList.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-muted-foreground">
                            No categories yet. Create your first category!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {categoriesList.map((category) => (
                            <Card key={category.id}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {category.name}
                                    </CardTitle>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(category)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDelete(category.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="secondary">
                                        {category.transactions_count || 0}{' '}
                                        transactions
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
