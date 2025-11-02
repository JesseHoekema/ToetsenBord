import type { RequestHandler } from './$types';
import { editNotes, addLink, removeLink } from '$lib/homeworkdata';
import { getUserFromCookie } from '@/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const token = cookies.get('session');

    if (!token) {
      return new Response(JSON.stringify({ error: 'Not autenticated' }), { status: 401 });
    }
    const user = await getUserFromCookie(token)

    if (!user) {
      return new Response(JSON.stringify({ error: 'Not autenticated' }), { status: 401 });
    }

    const { action, vak, dateDue, content } = body;

    if (!vak || !dateDue || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    let result;

    switch (action) {
      case 'editNotes':
        if (content === '') {
          result = await editNotes(user.id, vak, dateDue, content);
          break;
        }
        if (!content) {
          return new Response(JSON.stringify({ error: 'Missing notes content' }), { status: 400 });
        }
        result = await editNotes(user.id, vak, dateDue, content);
        break;

      case 'addLink':
        if (!content) {
          return new Response(JSON.stringify({ error: 'Missing link URL' }), { status: 400 });
        }
        result = await addLink(user.id, vak, dateDue, content);
        break;

      case 'removeLink':
        if (!content) {
          return new Response(JSON.stringify({ error: 'Missing link URL' }), { status: 400 });
        }
        result = await removeLink(user.id, vak, dateDue, content);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
