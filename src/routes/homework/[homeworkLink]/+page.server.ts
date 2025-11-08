import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import { redirect } from '@sveltejs/kit';
import { getUserFromCookie } from '$lib/auth';
import { getHomeworkItem } from '$lib/somtoday';


function parseHomeworkLink(homeworkLink: string): { vak: string; datum: string } {
    // Expected format: "vak-name-YYYY-MM-DD" or "vak-name-no-date"
    const datePattern = /(\d{4}-\d{2}-\d{2})$/;
    const match = homeworkLink.match(datePattern);

    if (!match) {
        throw new Error('Invalid homework link format - no valid date found');
    }

    const datum = match[1]; // This will be "2025-11-07"
    const vakSlug = homeworkLink.substring(0, homeworkLink.length - datum.length - 1);

    const vak = vakSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return { vak, datum };
}

export const load: PageServerLoad = async ({ cookies, params }) => {
    const { homeworkLink } = params;
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

    if (!session.somtodayToken) {
        return {
            user: {
                id: session.id,
                email: session.email,
                name: session.name ?? "User",
                avatar: session.profilePicture?.toString() || ""
            }
        };
    }

    const { vak, datum } = parseHomeworkLink(homeworkLink);

    let homeworkItem = await getHomeworkItem(vak, datum, session.somtodayToken);


    if (!homeworkItem) {
        homeworkItem = {
            onderwerp: 'Niet gevonden',
            omschrijving: 'Dit huiswerk is niet gevonden. Controleer of je de juiste link hebt gebruikt.',
            vak: "niet gevonden",
            datum: "0000-00-00",
            image_url: 'https://placehold.co/190x250?text=koppel som',
            notes: '',
            links: [],
            lesgroep: '',
            bijlagen: [],
            formattedDate: datum
        };
    }

    return {
        user: {
            id: session.id,
            email: session.email,
            name: session.name ?? "User",
            avatar: session.profilePicture?.toString() || ""
        },
        homeworkItem
    };
};
