import type { RequestHandler } from './$types';
import { editNotes, addBook, addLink, removeBook, removeLink } from '$lib/examdata';
import { getUserFromCookie } from '@/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const token = cookies.get('session');

    if (!token) {
      return new Response(JSON.stringify({ error: 'Not autenticated' }), { status: 401 });
    }
    const user = getUserFromCookie(token)

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
          result = await editNotes(vak, dateDue, content);
          break;
        }
        if (!content) {
          return new Response(JSON.stringify({ error: 'Missing notes content' }), { status: 400 });
        }
        result = await editNotes(vak, dateDue, content);
        break;

      case 'addBook':
        if (!content) {
          return new Response(JSON.stringify({ error: 'Missing book URL' }), { status: 400 });
        }
        result = await addBook(vak, dateDue, content);
        break;

      case 'addLink':
        if (!content) {
          return new Response(JSON.stringify({ error: 'Missing link URL' }), { status: 400 });
        }
        result = await addLink(vak, dateDue, content);
        break;

      case 'removeLink':
        if (!content) {
          return new Response(JSON.stringify({ error: 'Missing link URL' }), { status: 400 });
        }
        result = await removeLink(vak, dateDue, content);
        break
      case 'removeBook':
        if (!content) {
          return new Response(JSON.stringify({ error: 'Missing book Name' }), { status: 400 });
        }
        result = await removeBook(vak, dateDue, content);

        break
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
