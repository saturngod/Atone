import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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

interface TransactionFormProps {
    accounts: Account[];
    categories: Category[];
}

export default function TransactionForm({
    accounts,
    categories,
}: TransactionFormProps) {
    const [categorySearch, setCategorySearch] = useState('');
    const [newCategoryName, setNewCategoryName] = useState<string | null>(null);

    const form = useForm({
        account_id: accounts[0]?.id?.toString() || '',
        category_id: '',
        category_name: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase()),
    );

    const handleCategorySelect = (categoryId: string) => {
        form.setData('category_id', categoryId);
        form.setData('category_name', '');
        setNewCategoryName(null);
        setCategorySearch('');
    };

    const handleCategoryInputChange = (value: string) => {
        setCategorySearch(value);

        if (!value.trim()) {
            setNewCategoryName(null);
            form.setData('category_name', '');
            return;
        }

        const exists = categories.some(
            (c) => c.name.toLowerCase() === value.toLowerCase(),
        );

        if (!exists) {
            setNewCategoryName(value.trim());
            form.setData('category_id', '');
            form.setData('category_name', value.trim());
        } else {
            setNewCategoryName(null);
            form.setData('category_name', '');
            const matched = categories.find(
                (c) => c.name.toLowerCase() === value.toLowerCase(),
            );
            if (matched) {
                form.setData('category_id', matched.id.toString());
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/transactions', {
            onSuccess: () => {
                form.reset();
                setNewCategoryName(null);
                form.setData('date', new Date().toISOString().split('T')[0]);
            },
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-lg border bg-card p-6 shadow-sm"
        >
            <div className="mb-4 text-xl font-semibold">
                Quick Add Transaction
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="lg:col-span-1">
                    <Label htmlFor="amount">Amount</Label>
                    <div className="relative mt-1">
                        <span
                            className="absolute left-3 text-muted-foreground"
                            style={{ top: 5 }}
                        >
                            $
                        </span>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-7"
                            value={form.data.amount}
                            onChange={(e) =>
                                form.setData('amount', e.target.value)
                            }
                            required
                            autoFocus
                        />
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <Label>Category</Label>
                    <div className="relative mt-1">
                        <Input
                            placeholder="Search or type new..."
                            value={categorySearch}
                            onChange={(e) =>
                                handleCategoryInputChange(e.target.value)
                            }
                        />
                        {categorySearch && !newCategoryName && (
                            <div className="absolute z-10 mt-1 max-h-32 w-full overflow-auto rounded-md border bg-background shadow-md">
                                {filteredCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                                        onClick={() =>
                                            handleCategorySelect(
                                                category.id.toString(),
                                            )
                                        }
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        )}
                        {newCategoryName && (
                            <div className="mt-1 flex items-center gap-1 text-sm text-green-600">
                                <Plus className="h-3 w-3" />
                                <span>
                                    Create &quot;{newCategoryName}&quot;
                                </span>
                            </div>
                        )}
                    </div>
                    {(form.errors.category_id || form.errors.category_name) && (
                        <p className="mt-1 text-sm text-destructive">
                            {form.errors.category_id ||
                                form.errors.category_name}
                        </p>
                    )}
                </div>

                <div>
                    <Label>Account</Label>
                    <select
                        className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        value={form.data.account_id}
                        onChange={(e) =>
                            form.setData('account_id', e.target.value)
                        }
                        required
                    >
                        <option value="">Select...</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        className="mt-1 h-9"
                        value={form.data.date}
                        onChange={(e) => form.setData('date', e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        placeholder="Optional..."
                        className="mt-1 h-9"
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
                    />
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <Button type="submit" disabled={form.processing}>
                    {form.processing ? 'Adding...' : 'Add Transaction'}
                </Button>
            </div>
        </form>
    );
}
