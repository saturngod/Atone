import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useRef } from 'react';

export function useTimezone(): string {
    const props = usePage().props as Record<string, unknown>;
    const timezone = (props.timezone as string) || 'UTC';
    const hasAttemptedUpdate = useRef(false);

    useEffect(() => {
        // Only attempt to update timezone once per session
        if (hasAttemptedUpdate.current) {
            return;
        }

        const detectAndSetTimezone = async () => {
            const detectedTimezone =
                Intl.DateTimeFormat().resolvedOptions().timeZone;

            if (detectedTimezone !== timezone) {
                hasAttemptedUpdate.current = true;

                try {
                    await axios.patch('/settings/profile', {
                        timezone: detectedTimezone,
                    });
                } catch {
                    // Silently fail - timezone update is not critical
                    hasAttemptedUpdate.current = false;
                }
            }
        };

        detectAndSetTimezone();
    }, [timezone]);

    return timezone;
}
