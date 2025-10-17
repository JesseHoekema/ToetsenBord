// src/routes/api/books/edit/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { editBook } from '@/books';
import { getUserFromCookie } from '$lib/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const token = cookies.get('session');
		if (!token) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = await getUserFromCookie(token);
		if (!user) {
			return json({ error: 'Invalid session' }, { status: 401 });
		}

		const body = await request.json();
		const { bookId, title, type, onlineBook } = body;

		if (!bookId) {
			return json({ error: 'Missing bookId' }, { status: 400 });
		}

		const updatedBook = await editBook(bookId, user.id, title, type, onlineBook);

		return json({ success: true, book: updatedBook });
	} catch (error: any) {
		console.error(error);
		return json({ error: error.message ?? 'Failed to edit book' }, { status: 500 });
	}
};
