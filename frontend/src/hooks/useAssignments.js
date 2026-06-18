import { useState, useEffect } from 'react';
import { fetchAssignments } from '../lib/api';

export function useAssignments(pollInterval = 10000, activeOnly = false) {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            try {
                const data = await fetchAssignments({ activeOnly });
                if (isMounted) {
                    setAssignments(data);
                    setLoading(false);
                }
            } catch (e) {
                console.error('Failed to fetch assignments', e);
            }
        };

        load();
        const intervalId = setInterval(load, pollInterval);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [pollInterval, activeOnly]);

    return { assignments, loading };
}
