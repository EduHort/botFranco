import fs from "fs";
import * as xlsx from "xlsx";

const excelFilePath = "../respostas.xlsx";

// Função para carregar ou criar o arquivo Excel
function loadWorkbook(): xlsx.WorkBook {
    let workbook: xlsx.WorkBook;
    if (fs.existsSync(excelFilePath)) {
        const fileBuffer = fs.readFileSync(excelFilePath);
        workbook = xlsx.read(fileBuffer, { type: "buffer" });
    } else {
        workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.aoa_to_sheet([
            ["Numero", "Setor", "Data", "Dia Semana", "Resposta", "Tempo"]
        ]);
        xlsx.utils.book_append_sheet(workbook, worksheet, "Respostas");
        xlsx.writeFile(workbook, excelFilePath);
    }
    return workbook;
}

// Função para adicionar uma nova linha ao arquivo Excel e retornar o índice da linha
export function addRowToExcel(rowData: any[], update: boolean = false, rowNumber: number | null = null): number | null {
    const workbook = loadWorkbook();
    const sheet = workbook.Sheets["Respostas"];

    if (!sheet["!ref"]) {
        sheet["!ref"] = "A1:F1";
    }

    const range = xlsx.utils.decode_range(sheet["!ref"]);
    let insertedRow: number | null = null;

    if (update && rowNumber !== null) {
        // Atualiza uma linha existente
        const targetRow = range.s.r + rowNumber;
        rowData.forEach((value, index) => {
            const cellAddress = xlsx.utils.encode_cell({ r: targetRow, c: index });
            sheet[cellAddress] = { t: "s", v: value || sheet[cellAddress]?.v };
        });
        insertedRow = rowNumber;
    } else {
        // Adiciona uma nova linha no final
        xlsx.utils.sheet_add_aoa(sheet, [rowData], { origin: -1 });
        insertedRow = range.e.r + 1;
    }

    xlsx.writeFile(workbook, excelFilePath);
    return insertedRow;
}
