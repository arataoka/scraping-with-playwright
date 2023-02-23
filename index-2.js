import {chromium} from "@playwright/test";
import * as fs from "fs";
import {Parser} from "json2csv"

export const getEmployeesByScraping = async () => {
    // tab
    try {
        const browser = await chromium.launch({
            headless: false, // ブラウザ動作
            slowMo: 1000 //スローモーション
        });
        const page = await browser.newPage();
        await page.goto("https://artokys.netlify.app");
        const moreButtonLocator =  page.locator("text=More Blogs");
        await moreButtonLocator.click();
        const cardLocators =  page.locator(".item");
        const cardCount = await cardLocators.count();

        const array = [];
        for(let i=0; i< cardCount; i++){
            const cardLocator =  cardLocators.locator(`nth=${i}`).locator(".title")
            const text = await cardLocator.textContent();
            array.push({name:text, id:i});
        }
        await browser.close();
        const parser = new Parser();
        console.log(array);  // [{name:"text"}, {name:"text"}]
        const csv = parser.parse(array)
        fs.writeFileSync("./text-data.csv", csv)
        return array
    } catch (e) {
        console.error(e);
    }
}