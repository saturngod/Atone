import { useEffect, useState } from 'react';

export function useVisualViewport() {
    const [viewport, setViewport] = useState<{
        height: number;
        offsetTop: number;
        pageTop: number;
        scale: number;
        width: number;
    } | null>(null);

    useEffect(() => {
        // Only run on client side and if visualViewport exists
        if (typeof window === 'undefined' || !window.visualViewport) {
            return;
        }

        const handleResize = () => {
            if (!window.visualViewport) return;
            setViewport({
                height: window.visualViewport.height,
                offsetTop: window.visualViewport.offsetTop,
                pageTop: window.visualViewport.pageTop,
                scale: window.visualViewport.scale,
                width: window.visualViewport.width,
            });
        };

        // Initial set
        handleResize();

        window.visualViewport.addEventListener('resize', handleResize);
        window.visualViewport.addEventListener('scroll', handleResize);

        return () => {
            if (!window.visualViewport) return;
            window.visualViewport.removeEventListener('resize', handleResize);
            window.visualViewport.removeEventListener('scroll', handleResize);
        };
    }, []);

    return viewport;
}
