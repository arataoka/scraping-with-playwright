import {chromium} from "@playwright/test";

(async () => {
    // tab
    const browser = await chromium.launch({
        headless: false, // ブラウザ動作
        slowMo: 1000 //スローモーション
    });
    const page = await browser.newPage();
    await page.goto("https://artokys.netlify.app");
    // const htmlStr = await page.content();
    const occupationLocator =  page.locator(".sub-position");
    const occupationText = await occupationLocator.innerText();

    // get element by xpath
    const residenceLocator = page.locator('//*[@id="About"]/div/div/div[2]/div/ul/li[3]/p');
    const residenceText = await residenceLocator.innerText();
    console.log(occupationText);
    console.log(residenceText)
    // await page.mouse.wheel(0, 3000);
    const messageLocator = page.locator("textarea");
    await messageLocator.type("this is me")
    const sendButtonLocator = page.locator("text='Send'");
    await sendButtonLocator.click();

    await browser.close();
})()