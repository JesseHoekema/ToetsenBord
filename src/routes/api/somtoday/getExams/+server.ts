import type { RequestHandler } from './$types';
import { getExams } from '@/somtoday';
import { getUserFromCookie } from '@/auth';

export const GET: RequestHandler = async ({ cookies }) => {
    const token = cookies.get('session');

    if (!token) {
        return new Response(JSON.stringify({ error: 'No session token found' }), {
            status: 401
        });
    }

    try {
        const user = await getUserFromCookie(token);

        if (!user) {
            return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
                status: 401
            });
        }
        if (!user.somtodayToken) {
            return new Response(JSON.stringify({ error: 'No Somtoday token' }), { status: 401 });
        }
        const exams = await getExams(user.somtodayToken)

        return new Response(JSON.stringify(exams), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error getting exams:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500
        });
    }
};
