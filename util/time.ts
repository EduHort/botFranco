// Função para verificar se um horário está dentro dos intervalos permitidos
function isInAllowedInterval(date: Date): boolean {
    const day = date.getDay();
    const hour = date.getHours();
    const minutes = date.getMinutes();

    // Verifica se é sábado (6) ou domingo (0)
    if (day === 0 || day === 6) {
        return false;
    }

    // Verifica se está dentro dos intervalos: 8h30-12h e 13h-17h30
    const isMorning = (hour === 8 && minutes >= 30) || (hour > 8 && hour < 12) || (hour === 12 && minutes === 0);
    const isAfternoon = (hour === 13) || (hour > 13 && hour < 17) || (hour === 17 && minutes <= 30);

    return isMorning || isAfternoon;
}

// Função para avançar até o próximo horário permitido
function advanceToNextAllowedInterval(date: Date): Date {
    const hour = date.getHours();
    const minutes = date.getMinutes();

    // Se for antes das 8h30, avança para o primeiro intervalo permitido: 8h30
    if (hour < 8 || (hour === 8 && minutes < 30)) {
        date.setHours(8, 30, 0, 0);
    }
    // Se for após o meio-dia, avança para o próximo horário permitido (13:00)
    else if (hour === 12 && minutes > 0) {
        date.setHours(13, 0, 0, 0);
    }
    // Se for após 17:30, avança para o próximo dia útil às 8:30
    else if (hour > 17 || (hour === 17 && minutes > 30)) {
        date.setDate(date.getDate() + 1);
        if (date.getDay() === 6) { // Sábado
            date.setDate(date.getDate() + 2); // Avança para segunda-feira
        } else if (date.getDay() === 0) { // Domingo
            date.setDate(date.getDate() + 1); // Avança para segunda-feira
        }
        date.setHours(8, 30, 0, 0);
    }
    return date;
}

// Função para calcular o tempo entre duas datas considerando apenas os intervalos de trabalho
export function calculateWorkingTime(startDate: Date, endDate: Date): number {
    let current = new Date(startDate);

    // Verifica se a mensagem do cliente foi mandada fora do horário permitido
    if (!isInAllowedInterval(current)) {
        current = advanceToNextAllowedInterval(current);
    }

    // Se a data final for antes da data ajustada, retorna 0
    if (endDate < current) {
        return 0;
    }

    return Math.ceil((endDate.getTime() - startDate.getTime()) / 1000);
}
