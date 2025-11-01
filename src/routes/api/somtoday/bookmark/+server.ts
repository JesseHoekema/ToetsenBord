import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        const cdnUrl = 'https://raw.githubusercontent.com/JesseHoekema/ToetsenBord/refs/heads/main/src/routes/api/somtoday/bookmark/index.html';
        
        const response = await fetch(cdnUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch from CDN: ${response.statusText}`);
        }
        
        const htmlContent = await response.text();

        return new Response(htmlContent, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    } catch (error) {
        console.error('Error fetching from CDN:', error);
        return new Response('Error loading page', { status: 500 });
    }
};
