import type { RequestHandler } from './$types';
import { addBook } from '@/books';
import { getUserFromCookie } from '@/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        const { title, type, link } = body;

        if (!title || !type) {
            return new Response(JSON.stringify({ error: 'Missing title or type' }), { status: 400 });
        }

        const token = cookies.get('session');
        if (!token) {
            return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
        }

        const user = await getUserFromCookie(token);
        if (!user) {
            return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401 });
        }

        const newBook = await addBook(title, type, user.id, link);

        return new Response(
            JSON.stringify({ success: true, book: newBook }),
            { status: 201 }
        );

    } catch (error) {
        console.error('Error adding book:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
};
