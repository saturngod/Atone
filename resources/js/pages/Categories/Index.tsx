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
import categories from '@/routes/categories';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Layers, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Category {
    id: number;
    name: string;
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
    const [searchQuery, setSearchQuery] = useState('');

    const form = useForm({
        name: '',
    });

    const deleteForm = useForm({});

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return categoriesList;
        const query = searchQuery.toLowerCase();
        return categoriesList.filter((category) =>
            category.name.toLowerCase().includes(query),
        );
    }, [categoriesList, searchQuery]);

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
            <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Categories
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Organize your transactions by category
                        </p>
                    </div>
                    <Dialog
                        open={isDialogOpen}
                        onOpenChange={handleDialogChange}
                    >
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <div className="rounded-lg bg-orange-500/10 p-2">
                                        <Layers className="h-4 w-4 text-orange-600" />
                                    </div>
                                    {editingCategory
                                        ? 'Edit Category'
                                        : 'Create Category'}
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
                                        placeholder="e.g., Food & Dining, Transportation"
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
                                        {editingCategory ? 'Update' : 'Create'}
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
                            <div className="rounded-lg bg-orange-500/10 p-3">
                                <Layers className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Categories
                                </p>
                                <p className="text-2xl font-bold">
                                    {categoriesList.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    {categoriesList.length > 0 && (
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    )}
                </div>

                {/* Categories Grid */}
                {categoriesList.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
                        <div className="rounded-full bg-muted p-3">
                            <Layers className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="mt-3 font-medium text-muted-foreground">
                            No categories yet
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Create categories to organize your transactions!
                        </p>
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed">
                        <div className="rounded-full bg-muted p-3">
                            <Search className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="mt-3 font-medium text-muted-foreground">
                            No categories found
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Try a different search term
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredCategories.map((category) => (
                            <Card
                                key={category.id}
                                className="group transition-shadow hover:shadow-md"
                            >
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                                            <Layers className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <span className="font-medium">
                                            {category.name}
                                        </span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleEdit(category)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() =>
                                                handleDelete(category.id)
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
