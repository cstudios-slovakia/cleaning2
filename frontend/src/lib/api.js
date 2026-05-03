import { CONFIG } from '../config';

// Define API base URL. Use relative path if hosted together, or full URL for dev.
// Assuming the backend is at /api/public/ on the same domain, or we can use the specific domain.
export const API_BASE_URL = import.meta.env.DEV ? 'https://clean.cstudios.ninja/api/public' : '/api/public';

export const fetchAssignments = async () => {
    const res = await fetch(`${API_BASE_URL}/assignments.php`);
    if (!res.ok) throw new Error('Failed to fetch assignments');
    const json = await res.json();
    return json.data || [];
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

export const fetchProperties = async () => {
    const res = await fetch(`${API_BASE_URL}/properties.php`);
    if (!res.ok) throw new Error('Failed to fetch properties');
    const json = await res.json();
    return json.data || [];
};

export const saveProperty = async (property) => {
    const res = await fetch(`${API_BASE_URL}/properties.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(property)
    });
    if (!res.ok) throw new Error('Failed to save property');
    return res.json();
};

export const deleteProperty = async (id) => {
    const res = await fetch(`${API_BASE_URL}/properties.php?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete property');
    return res.json();
};

export const fetchRooms = async (propertyId = null) => {
    const url = propertyId ? `${API_BASE_URL}/rooms.php?property_id=${propertyId}` : `${API_BASE_URL}/rooms.php`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch rooms');
    const json = await res.json();
    return json.data || [];
};

export const fetchRoomDetails = async (id) => {
    const res = await fetch(`${API_BASE_URL}/rooms.php?id=${id}`);
    if (!res.ok) throw new Error('Failed to fetch room');
    const json = await res.json();
    return json.data || null;
};

export const saveRoom = async (room) => {
    const res = await fetch(`${API_BASE_URL}/rooms.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room)
    });
    if (!res.ok) throw new Error('Failed to save room');
    return res.json();
};

export const deleteRoom = async (id) => {
    const res = await fetch(`${API_BASE_URL}/rooms.php?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete room');
    return res.json();
};

export const fetchUsers = async () => {
    const res = await fetch(`${API_BASE_URL}/users.php`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
};

export const saveUser = async (user) => {
    const res = await fetch(`${API_BASE_URL}/users.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error('Failed to save user');
    return res.json();
};

export const deleteUser = async (id) => {
    const res = await fetch(`${API_BASE_URL}/users.php?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
};

export const sendPushNotification = async (action, propertyId) => {
    try {
        const res = await fetch(`${API_BASE_URL}/push_notify.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, propertyId })
        });
        return res.json();
    } catch (e) {
        console.error('Push error', e);
    }
};
