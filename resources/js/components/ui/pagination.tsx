import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface PaginationProps {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    meta: {
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}

export default function Pagination({ links, meta }: PaginationProps) {
    if (links.length <= 3) return null;

    return (
        <div className="flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
            <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{meta.from}</span> to{' '}
                <span className="font-medium">{meta.to}</span> of{' '}
                <span className="font-medium">{meta.total}</span> results
            </div>
            <div className="flex items-center gap-1">
                {links.map((link, i) => {
                    const isPrev = i === 0;
                    const isNext = i === links.length - 1;
                    const isNumber = !isPrev && !isNext;

                    if (!link.url && isNumber) {
                        return (
                            <div
                                key={i}
                                className="flex h-9 w-9 items-center justify-center"
                            >
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </div>
                        );
                    }

                    const Content = () => {
                        if (isPrev) return <ChevronLeft className="h-4 w-4" />;
                        if (isNext) return <ChevronRight className="h-4 w-4" />;
                        return <span>{link.label}</span>;
                    };

                    return (
                        <Button
                            key={i}
                            variant={link.active ? 'default' : 'outline'}
                            size={isNumber ? 'icon' : 'default'}
                            className={`h-9 ${isNumber ? 'w-9' : 'px-3'}`}
                            asChild
                            disabled={!link.url}
                        >
                            {link.url ? (
                                <Link
                                    href={link.url}
                                    preserveScroll
                                    preserveState
                                >
                                    <Content />
                                    {isPrev && <span className="ml-1 hidden sm:inline">Previous</span>}
                                    {isNext && <span className="mr-1 hidden sm:inline">Next</span>}
                                </Link>
                            ) : (
                                <span className="opacity-50">
                                    <Content />
                                    {isPrev && <span className="ml-1 hidden sm:inline">Previous</span>}
                                    {isNext && <span className="mr-1 hidden sm:inline">Next</span>}
                                </span>
                            )}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
