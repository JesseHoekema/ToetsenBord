import type { RequestHandler } from './$types';
import { connectWithAccessToken } from '$lib/somtoday';
import { getUserFromCookie } from '$lib/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { access_token } = await request.json();
        
        const token = cookies.get('session');
        if (!token) {
            return new Response(JSON.stringify({ error: 'Niet ingelogd' }), { status: 401 });
        }
        
        const user = await getUserFromCookie(token);
        if (!user) {
            return new Response(JSON.stringify({ error: 'Niet ingelogd' }), { status: 401 });
        }
        const result = await connectWithAccessToken(user.id, access_token);

        if (!result.success) {
            return new Response(
                JSON.stringify({ 
                    success: false, 
                    error: result.message || 'Er is iets misgegaan bij het verbinden met Somtoday' 
                }), 
                { status: 400 }
            );
        }

        return new Response(
            JSON.stringify({ 
                success: true,
                message: 'Succesvol verbonden met Somtoday'
            }), 
            { status: 200 }
        );
    } catch (error) {
        console.error('Error connecting to Somtoday:', error);
        return new Response(
            JSON.stringify({ 
                success: false,
                error: 'Er is een fout opgetreden tijdens het verbinden met Somtoday' 
            }), 
            { status: 500 }
        );
    }
};
