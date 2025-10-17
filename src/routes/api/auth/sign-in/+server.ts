import type { RequestHandler } from './$types';
import { loginWithPassword } from '@/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const { email, password } = await request.json();
  const result = await loginWithPassword(email, password);

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.message }), { status: 401 });
  }

  cookies.set('session', result.token!, {
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60
  });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};
