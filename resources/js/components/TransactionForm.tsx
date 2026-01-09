import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTimezone } from '@/hooks/use-timezone';
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

interface Merchant {
    id: number;
    name: string;
}

interface TransactionFormProps {
    accounts: Account[];
    categories: Category[];
    merchants: Merchant[];
}

// Get current date in user's timezone as YYYY-MM-DD
function getCurrentDateInTimezone(timezone: string): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
        // en-CA gives YYYY-MM-DD format
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    return formatter.format(now);
}

export default function TransactionForm({
    accounts,
    categories,
    merchants,
}: TransactionFormProps) {
    const timezone = useTimezone();
    const [categorySearch, setCategorySearch] = useState('');
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState<string | null>(null);
    const [merchantSearch, setMerchantSearch] = useState('');
    const [isMerchantDropdownOpen, setIsMerchantDropdownOpen] = useState(false);
    const [newMerchantName, setNewMerchantName] = useState<string | null>(null);

    const form = useForm({
        account_id: accounts[0]?.id?.toString() || '',
        category_name: '',
        merchant_name: '',
        amount: '',
        description: '',
        date: getCurrentDateInTimezone(timezone),
    });

    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase()),
    );

    const filteredMerchants = merchants.filter((merchant) =>
        merchant.name.toLowerCase().includes(merchantSearch.toLowerCase()),
    );

    const handleCategorySelect = (categoryId: string) => {
        const category = categories.find((c) => c.id.toString() === categoryId);
        if (category) {
            setCategorySearch(category.name);
            form.setData('category_name', category.name);
        }
        setNewCategoryName(null);
        setIsCategoryDropdownOpen(false);
    };

    const handleCategoryInputChange = (value: string) => {
        setCategorySearch(value);
        setIsCategoryDropdownOpen(true);
        form.setData('category_name', value);

        if (!value.trim()) {
            setNewCategoryName(null);
            return;
        }

        const exists = categories.some(
            (c) => c.name.toLowerCase() === value.toLowerCase(),
        );

        if (!exists) {
            setNewCategoryName(value.trim());
        } else {
            setNewCategoryName(null);
        }
    };

    const handleMerchantSelect = (merchantId: string) => {
        const merchant = merchants.find((m) => m.id.toString() === merchantId);
        if (merchant) {
            setMerchantSearch(merchant.name);
            form.setData('merchant_name', merchant.name);
        }
        setNewMerchantName(null);
        setIsMerchantDropdownOpen(false);
    };

    const handleMerchantInputChange = (value: string) => {
        setMerchantSearch(value);
        setIsMerchantDropdownOpen(true);
        form.setData('merchant_name', value);

        if (!value.trim()) {
            setNewMerchantName(null);
            return;
        }

        const exists = merchants.some(
            (m) => m.name.toLowerCase() === value.toLowerCase(),
        );

        if (!exists) {
            setNewMerchantName(value.trim());
        } else {
            setNewMerchantName(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/transactions', {
            onSuccess: () => {
                form.reset();
                setNewCategoryName(null);
                setNewMerchantName(null);
                setCategorySearch('');
                setMerchantSearch('');
                form.setData('date', getCurrentDateInTimezone(timezone));
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
                            onFocus={() => setIsCategoryDropdownOpen(true)}
                            onBlur={() =>
                                setTimeout(
                                    () => setIsCategoryDropdownOpen(false),
                                    200,
                                )
                            }
                        />
                        {filteredCategories.length > 0 &&
                            categorySearch &&
                            isCategoryDropdownOpen && (
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
                    {form.errors.category_name && (
                        <p className="mt-1 text-sm text-destructive">
                            {form.errors.category_name}
                        </p>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <Label>Merchant</Label>
                    <div className="relative mt-1">
                        <Input
                            placeholder="Optional..."
                            value={merchantSearch}
                            onChange={(e) =>
                                handleMerchantInputChange(e.target.value)
                            }
                            onFocus={() => setIsMerchantDropdownOpen(true)}
                            onBlur={() =>
                                setTimeout(
                                    () => setIsMerchantDropdownOpen(false),
                                    200,
                                )
                            }
                        />
                        {filteredMerchants.length > 0 &&
                            merchantSearch &&
                            isMerchantDropdownOpen && (
                                <div className="absolute z-10 mt-1 max-h-32 w-full overflow-auto rounded-md border bg-background shadow-md">
                                    {filteredMerchants.map((merchant) => (
                                        <button
                                            key={merchant.id}
                                            type="button"
                                            className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                                            onClick={() =>
                                                handleMerchantSelect(
                                                    merchant.id.toString(),
                                                )
                                            }
                                        >
                                            {merchant.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        {newMerchantName && (
                            <div className="mt-1 flex items-center gap-1 text-sm text-green-600">
                                <Plus className="h-3 w-3" />
                                <span>
                                    Create &quot;{newMerchantName}&quot;
                                </span>
                            </div>
                        )}
                    </div>
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
