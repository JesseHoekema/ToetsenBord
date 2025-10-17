import type { RequestHandler } from './$types';
import { removeBook } from '@/books';
import { getUserFromCookie } from '@/auth';

export const DELETE: RequestHandler = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        const { bookId } = body;

        if (!bookId) {
            return new Response(JSON.stringify({ error: 'Missing bookId' }), { status: 400 });
        }

        const token = cookies.get('session');
        if (!token) {
            return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
        }

        const user = await getUserFromCookie(token);
        if (!user) {
            return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
        }

        const result = await removeBook(bookId, user.id);

        if (!result) {
            return new Response(JSON.stringify({ error: 'Failed to remove book' }), { status: 500 });
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Book removed successfully' }),
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting book:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
};
