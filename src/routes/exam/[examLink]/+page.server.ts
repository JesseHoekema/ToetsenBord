import type { PageServerLoad } from './$types';
import { getUserFromCookie } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import { getExam } from '$lib/somtoday';
import { getBooks } from '@/books';

function parseExamLink(examLink: string): { vak: string; datum: string } {
    const datePattern = /(\d{4}-\d{2}-\d{2})$/;
    const match = examLink.match(datePattern);

    if (!match) {
        throw new Error('Invalid exam link format');
    }

    const dateString = match[1];
    const vakSlug = examLink.substring(0, examLink.length - dateString.length - 1);

    const vak = vakSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return { vak, datum: dateString };
}

function slugify(title: unknown): string {
    const safe = typeof title === 'string' ? title : String(title ?? 'onbekend');
    return safe
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
}

export const load: PageServerLoad = async ({ params, cookies }) => {
    const { examLink } = params;
    const token = cookies.get('session');

    if (!token) throw redirect(303, '/sign-in');

    const user = await getUserFromCookie(token);
    const { vak, datum } = parseExamLink(examLink);
    const authToken = user?.somtodayToken;

    if (!authToken) throw redirect(303, '/somtoday-integration');

    let exam: any = null;

    try {
        exam = await getExam(vak, datum, authToken);
    } catch {
        exam = null;
    }

    exam = {
        onderwerp: String(exam?.onderwerp ?? 'koppel eerst somtoday'),
        omschrijving: String(exam?.omschrijving ?? 'koppel eerst somtoday! als je dit al gedaan hebt dan kan het zijn dat er iets mis is gegaan bij het opniew inloggen'),
        vak: String(exam?.vak ?? 'Koppel Somtoday'),
        datum: String(exam?.datum ?? datum ?? ''),
        lesgroep: String(exam?.lesgroep ?? ''),
        image_url: String(exam?.image_url ?? 'https://placehold.co/190x250?text=koppel som'),
        formattedDate: String(exam?.formattedDate ?? ''),
        links: Array.isArray(exam?.links)
            ? exam.links.map((l: unknown) => String(l ?? ''))
            : [],
        books: Array.isArray(exam?.books)
            ? exam.books.map((title: unknown) => ({
                title: String(title ?? ''),
                link: `/books/${slugify(title)}`
            }))
            : [],
        notes: exam?.notes
            ? Array.isArray(exam.notes)
                ? exam.notes.join('\n')
                : String(exam.notes ?? '')
            : undefined,
    };

    const books = await getBooks(user.id);

    const formattedBooks = books.map(book => ({
        value: `book${book.id}`,
        label: book.title
    }));
    return {
        user: {
            id: user?.id ?? 0,
            email: user?.email ?? '',
            name: user?.name ?? 'User',
            avatar: user?.profilePicture?.toString() ?? ""
        },
        exam,
        examLink,
        books: formattedBooks
    };
};
