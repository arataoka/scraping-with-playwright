import {GoogleSpreadsheet} from "google-spreadsheet"
import env from "dotenv";
import {getEmployeesByScraping} from "./index-2.js";

env.config()
import {createRequire} from "module"; // requireを作成する関数
const require = createRequire(import.meta.url);
const secrets = require("./google_secrets.json"); // node.jsでは「;」が無いとエラーになる

// https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}

(async () => {
    try {
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
        await doc.useServiceAccountAuth({
            client_email: secrets.client_email,
            private_key: secrets.private_key
        })

        await doc.loadInfo(); //sheetsのプロパティをロードする

        const sheet = doc.sheetsByIndex[0]; // 0番目のタブ
        await sheet.loadCells('A1:C4'); // sheetのセルをロード

        //読み込み処理
        const a1 = sheet.getCell(0, 0);
        const b2 = sheet.getCellByA1("B2");
        console.log("a1", a1.value);
        console.log(b2.value);

        //書き込み処理
        a1.value=1221;
        b2.value= '=sum(A1:A4)';
        b2.textFormat = {fontSize:20};
        await sheet.saveUpdatedCells();

        // シート読み込み
        await doc.loadInfo();
        // シート追加 ※header値を最初に定義
        await doc.addSheet({title:'persons', headerValues:['name','age', 'gender']});

        // シートの情報を取得
        const personSheet = doc.sheetsByTitle['persons'];
        // const row = await personSheet.addRow({
        //     name: "TOM",
        //     age:18,
        //     gender: "male"
        // })

        // シートにデータを追加
        const rows = await personSheet.addRows([{      name: "TOM",
            age:18,
            gender: "male"},{      name: "Mary",
            age:20,
            gender: "female"}]);

        rows.forEach(row =>async () => await row.save())

        rows[0].age=25;
        rows[0].save();

        // scrapingしたデータ
        const titleList = await getEmployeesByScraping();
        console.log(titleList);
        // 書き込む際はヘッダーが必要
        await doc.addSheet({title:'scraping', headerValues:['name','id']});
        const scrapingSheet =  doc.sheetsByTitle['scraping'];
        const scrapingRows = await scrapingSheet.addRows(titleList)

        scrapingRows.forEach(row =>async () => await row.save())

    } catch (e){
        console.error(e)
    }
})();