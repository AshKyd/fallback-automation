import { env } from '$env/dynamic/private';
import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

let globalBrowser;

async function getBrowser() {
	if (globalBrowser) {
		return globalBrowser;
	}
	const isLocal = env.IS_LOCAL === '1';

	const args = [
		...(isLocal ? puppeteer.defaultArgs() : chromium.args),
		'--hide-scrollbars',
		'--disable-web-security'
	];
	const defaultViewport = chromium.defaultViewport;
	const executablePath = isLocal
		? env.BROWSER_PATH
		: await chromium.executablePath(
				`https://github.com/Sparticuz/chromium/releases/download/v130.0.0/chromium-v130.0.0-pack.tar`
			);
	console.log('executablePath :>> ', executablePath);
	globalBrowser = puppeteer.launch({
		args,
		defaultViewport,
		executablePath,
		headless: isLocal ? false : chromium.headless,
		// ignoreHTTPSErrors: true,
		protocolTimeout: 1000 * 60,
		timeout: 1000 * 60
	});
	return globalBrowser;
}

/**
 *
 * @param {string} url The URL to screenshot
 * @param {string} [selector] A CSS selector for the element to screenshot (default: `'body'`)
 * @param {number} [width] Set the viewport width before taking screenshot (default: `810`)
 * @param {number} [height] Set the viewport height before taking screenshot (default: `1080`)
 */
export async function getScreenshot(url, selector = 'body', width = 810, height = 1080) {
	const viewport = { width, height, deviceScaleFactor: 2 };
	const browser = await getBrowser();
	console.log('Screenshotting', url, selector, { width, height });
	const startTime = Date.now();
	const page = await browser.newPage();
	await page.setViewport(viewport);
	await page.goto(url, { waitUntil: 'networkidle0' });
	const el = await page.waitForSelector(selector);
	const file = await el?.screenshot();
	console.log('Screenshotting', url, Math.round((Date.now() - startTime) / 1000) + 's');
	page.close();
	return file;
}
