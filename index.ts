import { clearUserTrackingData, findUserTrackingData, registerUserInteraction, updateMessageTracking } from "./database/db";
import { TrackingData } from "./types/types";
import client from "./util/WhatsAppClient";
import { logError } from "./util/errors";
import { addRowToExcel } from "./util/excel";
import { calculateWorkingTime } from "./util/time";

const optionsMap: { [key: string]: string } = {
    '1': 'Comercial',
    '2': 'Contas a Receber (Clientes)',
    '3': 'Contas a Pagar (Fornecedores)',
    '4': 'Faturamento / Heishop',
    '5': 'Entrega',
    '6': 'Chopp Delivery',
    '7': 'Recursos Humanos',
    '8': 'Elogios ou Reclamações',
    '9': 'Alterar Cadastro',
    '10': 'Cancelar'
};

client.on('message', async (message) => {
    try {
        // Usar .includes para evitar espaços na mensagem
        if (message.fromMe && message.body.includes('')) {
            // Checa para mensagens em massa. Não fazer nada nesse caso.
        }
        else {
            // Busca os dados do usuário no banco de dados
            let userData: TrackingData | undefined;
            if (message.fromMe) {
                userData = findUserTrackingData(message.to);
            }
            else {
                userData = findUserTrackingData(message.from);
            }
            // Verifica se a mensagem indica um novo usuário que precisa ser registrado
            if (message.body.includes('Por favor digite o número da opção que você deseja') && message.fromMe && !userData) {
                // Registra o novo usuário no banco de dados
                registerUserInteraction(message.to);
            }
            // Verifica se o usuário existe e está esperando para escolher uma opção (1 a 9)
            else if (userData && !userData.option && !userData.replyTime && !userData.rowNumber) {
                // Verifica se o usuário escolheu uma opção válida (1-9)
                if (/^[1-9]$/.test(message.body.trim())) {
                    const option = optionsMap[message.body.trim()];     // Obtém a opção escolhida

                    const currentTime = new Date();
                    currentTime.setHours(currentTime.getHours() - 3);   // Ajusta o fuso horário para o Brasil
                    const weekday = currentTime.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().slice(0, 3);    // Obtém o dia da semana

                    // Adiciona os dados do cliente na planilha Excel e retorna o número da linha
                    const rowNumber = addRowToExcel([message.from.replace('@c.us', ''), option, currentTime.toLocaleString('pt-BR'), weekday]);

                    if (rowNumber) {
                        // Atualiza os dados do usuário no banco de dados com a opção, tempo e número da linha
                        updateMessageTracking(message.from, option, currentTime.toISOString(), rowNumber);
                    }
                }
                // Verifica se o cliente digitou '10' (Reiniciar o fluxo?)
                else if (/^10$/.test(message.body.trim())) {
                    // Limpa os dados de rastreamento do usuário no banco de dados
                    clearUserTrackingData(message.from); 
                }
            }
            // Verifica se a mensagem é do atendente e se o usuário está sendo atendido
            else if (message.fromMe && userData && userData.option && userData.replyTime && userData.rowNumber) {
                // Verifica se a mensagem do atendente NÃO contém frases específicas
                if (!message.body.includes('estou encaminhando para atendimento') || !message.body.includes('Estamos fechados no momento') || !message.body.includes('Nossos atendentes estão em horário de almoço')) {
                    const replyTime = new Date(userData.replyTime);
                    const atendenteReplyTime = new Date();
                    atendenteReplyTime.setHours(atendenteReplyTime.getHours() - 3);   // Ajusta o fuso horário para o Brasil

                    // Calcula o tempo de resposta do atendente
                    const timeDiff = calculateWorkingTime(replyTime, atendenteReplyTime);

                    // Atualiza o tempo de resposta do atendente na planilha Excel
                    addRowToExcel([null, null, null, null, atendenteReplyTime.toLocaleString('pt-BR'), timeDiff.toFixed(2)], true, userData.rowNumber);

                    // Limpa os dados de rastreamento do usuário no banco de dados
                    clearUserTrackingData(message.to);
                }
            }
        }
    }
    catch (error) {
        logError(error, 'Erro ao executar o comando');
    }
});
