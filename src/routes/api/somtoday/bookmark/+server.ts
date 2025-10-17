import type { RequestHandler } from './$types';
import { readFileSync } from 'fs';
import { join } from 'path';

export const GET: RequestHandler = async () => {
    try {
        const htmlContent = readFileSync(
            join(process.cwd(), 'src/routes/api/somtoday/bookmark/index.html'),
            'utf-8'
        );

        return new Response(htmlContent, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    } catch (error) {
        console.error('Error serving bookmark HTML:', error);
        return new Response('Error loading page', { status: 500 });
    }
};
