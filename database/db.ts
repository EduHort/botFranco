import Database from "better-sqlite3";
import { TrackingData } from "../types/types";
import { logError } from "../util/errors";

// Conectar ao banco de dados SQLite
const db = new Database("./messageTracking.db");
console.log("✅ Conectado ao banco de dados SQLite.");

// Criar a tabela se não existir
try {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS tracking (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT NOT NULL,
            option TEXT,
            replyTime TEXT,
            rowNumber INTEGER
        )
    `).run();
} catch (error) {
    logError(error, "Erro ao criar a tabela");
}

// Registra uma interação de um usuário
export function registerUserInteraction(user: string): void {
    try {
        const query = db.prepare("INSERT INTO tracking (user) VALUES (?)");
        query.run(user);
    } catch (error) {
        logError(error, "Erro ao registrar interação do usuário");
    }
}

// Atualiza o rastreamento de um usuário
export function updateMessageTracking(user: string, option: string, replyTime: string, rowNumber: number): void {
    try {
        const query = db.prepare("UPDATE tracking SET option = ?, replyTime = ?, rowNumber = ? WHERE user = ?");
        query.run(option, replyTime, rowNumber, user);
    } catch (error) {
        logError(error, "Erro ao atualizar rastreamento de mensagem");
    }
}

// Limpa o rastreamento de um usuário
export function clearUserTrackingData(user: string): void {
    try {
        const query = db.prepare("DELETE FROM tracking WHERE user = ?");
        query.run(user);
    } catch (error) {
        logError(error, "Erro ao limpar dados de rastreamento do usuário");
    }
}

// Busca os dados de rastreamento de um usuário
export function findUserTrackingData(user: string): TrackingData | undefined {
    try {
        const query = db.prepare("SELECT * FROM tracking WHERE user = ?");
        return query.get(user) as TrackingData | undefined;
    } catch (error) {
        logError(error, "Erro ao buscar dados de rastreamento do usuário");
        return undefined;
    }
}
