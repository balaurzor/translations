const glob = require('glob');
const fs = require('fs');
import { includes } from 'lodash';
import * as ExcelJS from 'exceljs';

const workbook = new ExcelJS.Workbook();

glob('**.en.ts', (_err, files) => {
    files.forEach((file) => {
        const fileData = require(`./${file}`);
        Object.keys(fileData).forEach((key) => {
            const flatObject = flattenObject(fileData[key]);

            const textKeys = ['helpText', 'value', 'text']

            const finalText = {};
            
            Object.keys(flatObject).forEach((key) => {
                if(includes(key, ...textKeys)) {
                    finalText[key] = flatObject[key];
                }
            });

            const worksheet = workbook.addWorksheet(file);

            worksheet.columns = [
                { header: 'Id', key: 'id', width: 10 },
                { header: 'Key', key: 'key', width: 10 },
                { header: 'Value', key: 'value', width: 32 },
                { header: 'Translation', key: 'translation', width: 32 }
            ];

            Object.keys(finalText).forEach((k, index) => {
                worksheet.addRow({
                    id: index + 1,
                    key: k,
                    value: finalText[k]
                });
            });
        });

        workbook.xlsx.writeFile('Translations.csv')
    });
});

function flattenObject(object) {
    const result = {};

    for (const i in object) {
        if (!object.hasOwnProperty(i)) continue;

        if ((typeof object[i]) == 'object' && object[i] !== null) {
            const flatObject = flattenObject(object[i]);

            for (const key in flatObject) {
                if (!flatObject.hasOwnProperty(key)) continue;

                result[i + '.' + key] = flatObject[key];
            }
        } else {
            result[i] = object[i];
        }
    }
    return result;
}