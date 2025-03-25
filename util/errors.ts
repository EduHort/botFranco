import fs from "fs";

// Função para registrar logs de erro
export function logError(error: any, context: string) {
    const logMessage = `${new Date().toISOString()} - ${context}: ${error}\n`;
    fs.appendFileSync("error.log", logMessage);
}
