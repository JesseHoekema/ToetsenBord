import type { RequestHandler } from './$types';
import { getVakBoekImage } from '$lib/books'; // adjust path to your module

export const GET: RequestHandler = async ({ url }) => {
  const vak = url.searchParams.get('vak');

  if (!vak) {
    return new Response(JSON.stringify({ error: 'Missing vak parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const imageUrl = await getVakBoekImage(vak);

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'No image found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ vak, imageUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
