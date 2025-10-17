import type { PageServerLoad } from './$types';
import { prisma } from '$lib/prisma';
import { redirect } from '@sveltejs/kit';
import { getUserFromCookie } from '$lib/auth';


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

    return {
        user: {
            id: session.id,
            email: session.email,
            name: session.name ?? "User",
            avatar: session.profilePicture?.toString() || ""
        }
    };
};
