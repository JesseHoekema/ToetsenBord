import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import { refreshSomtodayToken } from '@/somtoday';

export async function GET({ url }) {
    const tokenParam = url.searchParams.get('token');

    if (!tokenParam) {
        return json({ success: false, message: 'No token provided' }, { status: 400 });
    }
    if (tokenParam !== "refreshAll1") {
        return json({ success: false, message: 'Token Not Valid' }, { status: 400 });
    }

    const users = await prisma.user.findMany({ select: { id: true } });
    const results = [];

    for (const user of users) {
        const res = await refreshSomtodayToken(user.id);
        results.push({ id: user.id, message: res.message });
    }

    return json({ success: true, refreshed: results.length, details: results });
}