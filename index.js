import {chromium} from "@playwright/test";

(async () => {
    // tab
    const browser = await chromium.launch({
        headless: false, // ブラウザ動作
        slowMo: 500 //スローモーション
    });
    const page = await browser.newPage();
    await page.goto("https://artokys.netlify.app");
    const htmlStr = await page.content();
    console.log(htmlStr);
    await browser.close();
})()