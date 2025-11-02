import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserFromCookie, deleteAccount } from '$lib/auth';

export const DELETE: RequestHandler = async ({ cookies }) => {
    try {
        const token = cookies.get('session');
        if (!token) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = await getUserFromCookie(token);
        
        if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        await deleteAccount(user.id);

        cookies.delete('session', { path: '/' });

        return json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        return json({ error: 'Failed to delete account' }, { status: 500 });
    }
};