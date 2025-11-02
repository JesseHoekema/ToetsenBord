import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserFromCookie, changeUserInfo } from '$lib/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const token = cookies.get('session');
    if (!token) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await getUserFromCookie(token);

    if (!user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email } = await request.json();

    if (!name || !email) {
        return json({ error: 'Name and email are required' }, { status: 400 });
    }

    try {
        await changeUserInfo(user.id, name, email);
        return json({ success: true });
    } catch (error) {
        return json({ error: 'Failed to update user information' }, { status: 500 });
    }
};