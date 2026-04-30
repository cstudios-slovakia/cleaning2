import { CONFIG } from '../config';

// Define API base URL. Use relative path if hosted together, or full URL for dev.
// Assuming the backend is at /api/public/ on the same domain, or we can use the specific domain.
export const API_BASE_URL = import.meta.env.DEV ? 'https://clean.cstudios.ninja/api/public' : '/api/public';

export const fetchAssignments = async () => {
    const res = await fetch(`${API_BASE_URL}/assignments.php`);
    if (!res.ok) throw new Error('Failed to fetch assignments');
    const json = await res.json();
    return json.data;
};

export const saveAssignment = async (assignment) => {
    const res = await fetch(`${API_BASE_URL}/assignments.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment)
    });
    if (!res.ok) throw new Error('Failed to save assignment');
    return res.json();
};
