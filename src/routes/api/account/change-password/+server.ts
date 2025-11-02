import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { changePassword } from '$lib/auth';
import { getUserFromCookie } from '$lib/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const token = cookies.get('session');
        if (!token) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = await getUserFromCookie(token);
        
        if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return json({ error: 'Current password and new password are required' }, { status: 400 });
        }

        const result = await changePassword(user.id, currentPassword, newPassword);

        if (!result) {
            return json({ error: 'Failed to change password' }, { status: 500 });
        }
        if (result.success === false) {
            return json({ error: result.message || 'Failed to change password' }, { status: 400 });
        }
        return json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        return json({ error: 'Failed to change password' }, { status: 500 });
    }
};