import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export function useTimezone(): string {
    const props = usePage().props as Record<string, unknown>;
    const timezone = (props.timezone as string) || 'UTC';

    useEffect(() => {
        const detectAndSetTimezone = async () => {
            const detectedTimezone =
                Intl.DateTimeFormat().resolvedOptions().timeZone;

            if (detectedTimezone !== timezone) {
                try {
                    await fetch('/settings/profile', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN':
                                document
                                    .querySelector('meta[name="csrf-token"]')
                                    ?.getAttribute('content') || '',
                        },
                        body: JSON.stringify({ timezone: detectedTimezone }),
                    });
                } catch (error) {
                    console.error('Failed to update timezone:', error);
                }
            }
        };

        detectAndSetTimezone();
    }, [timezone]);

    return timezone;
}
