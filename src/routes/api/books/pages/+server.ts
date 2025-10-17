import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { addPage, removePage } from '@/books';
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

        const { bookPage, bookId } = await request.json();

        if (!bookPage || !bookId) {
            return json({ error: 'Missing bookPage or bookId' }, { status: 400 });
        }

        const updatedBook = await addPage(bookPage, bookId, user.id);

        return json({ success: true, book: updatedBook });
    } catch (error: any) {
        console.error('Error adding page:', error);
        return json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ request, cookies }) => {
    try {
        const token = cookies.get('session');
        if (!token) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await getUserFromCookie(token);
        if (!user) {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bookPage, bookId } = await request.json();

        if (!bookPage || !bookId) {
            return json({ error: 'Missing bookPage or bookId' }, { status: 400 });
        }

        const updatedBook = await removePage(bookPage, bookId, user.id);

        return json({ success: true, book: updatedBook });
    } catch (error: any) {
        console.error('Error removing page:', error);
        return json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
};
