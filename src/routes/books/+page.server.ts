import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import { redirect } from '@sveltejs/kit';
import { getBooks } from '@/books';
import { getUserFromCookie } from '@/auth';
import { getVakBoekImage } from '@/books';


export const load: PageServerLoad = async ({ cookies }) => {
    const token = cookies.get('session');

    if (!token) {
        throw redirect(303, '/sign-in');
    }

    const session = await getUserFromCookie(token)

    if (!session || session.expiresAt < new Date()) {
        if (session) {
            await prisma.session.delete({ where: { id: session.id } });
        }
        throw redirect(303, '/sign-in');
    }
    const basicBooks = await getBooks(session.id)


    const books = await Promise.all(
        basicBooks.map(async (book) => {
            const image_url = await getVakBoekImage(book.type)
            const link = '/books/' + book.title.toLowerCase().replace(/\s+/g, '-');
            return { ...book, image_url, link };
        })
    );

    return {
        user: {
            id: session.id,
            email: session.email,
            name: session.name ?? "User",
            avatar: session.profilePicture?.toString() || ""
        },
        books
    };
};
