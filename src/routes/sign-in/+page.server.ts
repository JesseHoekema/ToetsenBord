import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUserFromCookie } from '@/auth';


export const load: PageServerLoad = async ({ cookies }) => {
    const token = cookies.get('session');

    if (!token) {
        return;
    }
    
    const user = await getUserFromCookie(token);

    if (user) {
        throw redirect(303, '/start');
    }
}