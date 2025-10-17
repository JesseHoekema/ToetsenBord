import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';


export const load: PageServerLoad = async ({ cookies }) => {
    const token = cookies.get('session');

    if (token) {
        throw redirect(303, '/start');
    }
}