import { getScreenshot } from '$lib/browser.server.js';
import { error, json } from '@sveltejs/kit';

export const config = {
	maxDuration: 60
};

export let GET = async ({ url }) => {
	const target = url.searchParams.get('url');
	const selector = url.searchParams.get('selector') || 'body';
	const width = +(url.searchParams.get('width') || '0') || undefined;
	const height = +(url.searchParams.get('width') || '0') || undefined;

	if (!target) {
		return error(404, 'URL must be provided.');
	}
	if (target === 'test') {
		return json({ status: 'ok' });
	}

	const screenshot = await getScreenshot(target, selector, width, height);

	if (!screenshot) {
		return error(500, 'Failed to generate screenshot.');
	}

	return new Response(Buffer.from(screenshot));
};

export let OPTIONS = async () => {
	return new Response('ok');
};
