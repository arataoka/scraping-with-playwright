import {chromium} from "@playwright/test";
import dayjs from "dayjs";
import cron from "node-cron";
import fetch from "node-fetch";
import env from "dotenv";

env.config();

const CLOCK_IN_SELECTOR = ".clock_in";
const CLOCK_OUT_SELECTOR = ".clock_out";

const checkHoliday = async (formatDate) => {
    const res = await fetch("https://holidays-jp.github.io/api/v1/date.json");
    const json = await res.json();
    const holidays = Object.keys(json);
    return holidays.includes(formatDate);
}

const loginToPage = async (page) => {
    await page.goto(process.env.TARGET_URL);
    const companyIdLocator = page.locator("[placeholder='会社ID']");
    const accountLocator = page.locator("[placeholder='アカウントID/メールアドレス']");
    const passLocator = page.locator("[placeholder='パスワード']");
    const loginButton = page.locator(".attendance-button-email");
    await companyIdLocator.type(process.env.COMPANY_ID);
    await accountLocator.type(process.env.EMAIL);
    await passLocator.type(process.env.PASS);
    await loginButton.click();
}

export const autoClockIn = async () => {
    const date = dayjs();
    const formatDate = date.format("YYYY-MM-DD");
    const isHoliday = await checkHoliday(formatDate);
    if (isHoliday) console.log("今日は祝日です");
    try {
        const browser = await chromium.launch({
            headless: false, // ブラウザ動作
            // slowMo: 1000 //スローモーション
        });
        const page = await browser.newPage();
        await loginToPage(page);

        const clockInLocator = page.locator(CLOCK_IN_SELECTOR);
        const clockInButtonLocator = clockInLocator.locator("button");
        await clockInButtonLocator.click();
        console.log("勤務開始します");
    } catch (e) {
        console.error(e);
        console.error("勤務開始に失敗しました");
    }
}

export const autoClockOut = async () => {
    const date = dayjs();
    const formatDate = date.format("YYYY-MM-DD");
    const isHoliday = await checkHoliday(formatDate);
    if (isHoliday) console.log("今日は祝日です");
    try {
        const browser = await chromium.launch({
            headless: false, // ブラウザ動作
            // slowMo: 1000 //スローモーション
        });
        const page = await browser.newPage();
        await loginToPage(page);

        const clockOutLocator = page.locator(CLOCK_OUT_SELECTOR);
        const clockOutButtonLocator = clockOutLocator.locator("button");
        await clockOutButtonLocator.click();
        console.log("退勤しました");

        await page.goto(`${process.env.TARGET_URL}/workflow_requests/late_overtime_works/new?date=${formatDate}`)
        const overWorkInputLocator = page.locator("#workflow_request_workflow_request_content_late_overtime_work_attributes_workable_time");
        await overWorkInputLocator.type("2:00");
        const commentInputLocator = page.locator("#workflow_request_comment");
        await commentInputLocator.type("案件対応のため");
        const button = page.locator(".attendance-button-primary");
        await button.click();
        console.log("残業申請を行いました")


    } catch (e) {
        console.error(e);
        console.error("退勤に失敗しました");
    }
}

cron.schedule("55 9 * * 1-5", async () => {
    await autoClockIn();
})

cron.schedule("30 19 * * 1-5", async () => {
    await autoClockOut();
})


