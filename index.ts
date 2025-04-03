import { clearUserTrackingData, findUserTrackingData, registerUserInteraction, updateMessageTracking } from "./database/db";
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

client.on('message_create', async (message) => {
    try {
        if (message.fromMe) {   // Mensagem do atendente
            // Usar .includes para evitar espaços na mensagem
            if (message.body.includes('!!!!! Colocar a mensagem aqui !!!!!!')) {
                return; // Checa para mensagens em massa. Não fazer nada nesse caso.
            }
            const userData = findUserTrackingData(message.to); // Busca os dados do usuário no banco de dados
            // Verifica se o usuário existe e se já escolheu uma opção
            if (userData && userData.option && userData.replyTime && userData.rowNumber) {
                // Verifica se a mensagem é do atendente e se o usuário está sendo atendido. NÃO contém frases específicas
                if (!message.body.includes('estou encaminhando para atendimento') && !message.body.includes('Estamos fechados no momento') && !message.body.includes('Nossos atendentes estão em horário de almoço')) {
                    const replyTime = new Date(userData.replyTime);
                    const atendenteReplyTime = new Date();

                    // Calcula o tempo de resposta do atendente
                    const timeDiff = calculateWorkingTime(replyTime, atendenteReplyTime);

                    // Atualiza o tempo de resposta do atendente na planilha Excel
                    addRowToExcel([null, null, null, null, atendenteReplyTime.toLocaleString('pt-BR'), timeDiff.toFixed(2)], true, userData.rowNumber);

                    clearUserTrackingData(userData.user); // Limpa os dados de rastreamento do usuário no banco de dados
                }
                // Verifica se o usuário está sendo redirecionado
                else if (message.body.includes('Você está sendo redirecionado(a) para o setor')) {
                    // Extrai o setor da mensagem
                    const match = message.body.match(/para o setor (.+?)\./);
                    const option = match ? match[1] : ''; // Se encontrar o setor, usa ele. Senão, mantém vazio.

                    const currentTime = new Date();
                    const weekday = currentTime.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().slice(0, 3);    // Obtém o dia da semana

                    // Adiciona os dados do cliente na planilha Excel e retorna o número da linha
                    const rowNumber = addRowToExcel([userData.user.replace('@c.us', ''), option, currentTime.toLocaleString('pt-BR'), weekday]);

                    if (rowNumber) {
                        // Atualiza os dados do usuário no banco de dados com a opção, tempo e número da linha
                        updateMessageTracking(userData.user, option, currentTime.toISOString(), rowNumber);
                    }
                }
            }
            else if (message.body.includes('Por favor digite o número da opção que você deseja')) {
                // Se o usuário não existe e vai escolher uma opção, registra o novo usuário no banco de dados
                registerUserInteraction(message.to);
            }
        }
        else {  // Mensagem do cliente
            const userData = findUserTrackingData(message.from);
            // Verifica se o usuário existe
            if (userData && !userData.option) {
                // Verifica se o usuário ainda não escolheu uma opção
                if (/^[1-8]$/.test(message.body.trim())) {
                    const option = optionsMap[message.body.trim()];     // Obtém a opção escolhida
    
                    const currentTime = new Date();
                    const weekday = currentTime.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().slice(0, 3);    // Obtém o dia da semana
    
                    // Adiciona os dados do cliente na planilha Excel e retorna o número da linha
                    const rowNumber = addRowToExcel([userData.user.replace('@c.us', ''), option, currentTime.toLocaleString('pt-BR'), weekday]);
    
                    if (rowNumber) {
                        // Atualiza os dados do usuário no banco de dados com a opção, tempo e número da linha
                        updateMessageTracking(userData.user, option, currentTime.toISOString(), rowNumber);
                    }
                }
                // Verifica se o cliente digitou '9' ou '10' para excluir o cadastro
                else if (/^(9|10)$/.test(message.body.trim())) {
                    clearUserTrackingData(userData.user);
                }
                else {
                    return;
                }
            }
        }
    }
    catch (error) {
        logError(error, 'Erro ao executar o comando');       
    }
});
