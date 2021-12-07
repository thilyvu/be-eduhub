import axios from "axios";
import { read, utils } from "xlsx";

export async function importDataFromExcelURL(url) {
  try {
    const xmlData = await axios
      .get(url, { responseType: "arraybuffer" })
      .then((res) => res.data);
    const workbook = read(xmlData);
    const split = String(url).split("?")[0].split("/").pop().split("/").pop();
    const fileName = decodeURIComponent(JSON.parse(JSON.stringify(split)))
      .split("/")
      .pop();
    return {
      fileName,
      data: workbook.SheetNames.map((sheetName) => {
        return {
          sheetName,
          data: utils.sheet_to_json(workbook.Sheets[sheetName]),
        };
      }),
    };
  } catch (err) {
    console.log(err);
  }
}
