import type { PageServerLoad } from './$types';
import { getUserFromCookie } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import { getExam } from '$lib/somtoday';
import { getBook } from '@/books';

function parseBookLink(bookTitle: string): string {
    return bookTitle
        .split('-')
        .join(' ');
}


function slugify(title: unknown): string {
    const safe = typeof title === 'string' ? title : String(title ?? 'onbekend');
    return safe
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
}

export const load: PageServerLoad = async ({ params, cookies }) => {
    const { bookLink } = params;
    const token = cookies.get('session');

    if (!token) throw redirect(303, '/sign-in');

    const user = await getUserFromCookie(token);
    const vak = parseBookLink(bookLink);
    const authToken = user?.somtodayToken;

    if (!authToken) throw redirect(303, '/somtoday-integration');

    let book: any = null;

    try {
        book = await getBook(vak, user.id)
        if (!book) {
            throw redirect(404, '/books')
        }
    } catch {
        book = null;
    }


    return {
        user: {
            id: user?.id ?? 0,
            email: user?.email ?? '',
            name: user?.name ?? 'User',
            avatar: user?.profilePicture?.toString() || ""
        },
        book,
        bookLink: vak
    };
};
