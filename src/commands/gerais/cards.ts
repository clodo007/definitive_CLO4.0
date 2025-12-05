import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('carta')
    .setDescription('Esse comando irá gerar cartas de baralho')
    .addStringOption(option =>
        option
            .setName('quantidade')
            .setDescription('Quantas cartas você quer puxar? (1 a 9)')
            .setRequired(false)
    );

// Tipo que aceita SOMENTE números de 1 a 9
type OneToNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// Função que gera a carta
// *obs mudar depois para uma logica que puxe as imanges
function generateCard() {
    const suits = ["♠", "♥", "♦", "♣"];
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const suit = suits[Math.floor(Math.random() * suits.length)];
    const value = values[Math.floor(Math.random() * values.length)];
    return value + suit;
}

// Essa função compra as cartas de acordo com o valor passado pelo usuário
// Com a nova tipagem, o amount agora só irá aceitar números de 1 até 9 e caso o usuário não passe nada, a tipagem OneToNin já vai estar presetada como 1
function drawPlayingCards(amountOfDraws: OneToNine = 1): string[] {

    // Esse é o Objeto para guardar os resultados e mostrar no final
    const uniqueCardsResults = new Set<string>();
    // Esse loop ele olha, uniqueCardsReulst está do "tamanho" de cartas solicitadas pelo usuário? Se não tiver, ele fica rodando até cumprir o requisito
    // Ele genera uma carta e adiciona ao Objeto, ai ele viu que o objeto não cumpriu com o requisito e vai adicionando até mudar!
    while (uniqueCardsResults.size < amountOfDraws){
        uniqueCardsResults.add(generateCard())
    }
    // Aqui o operador REST, tira todos os elementos do Set e transforma em um array de string
    return [...uniqueCardsResults]
}

// Essa função foi criada para
function parseAmount(amountOfDraws: string | null): OneToNine | null {
    if (!amountOfDraws) return 1; // Ele sempre vai retornar 1 caso o usuário não passe nada

    const parsedAmount = Number(amountOfDraws); // Aqui ele transforma a string em Number

    // Verifica se é inteiro entre 1 e 9
    if (Number.isInteger(parsedAmount) && parsedAmount >= 1 && parsedAmount <= 9) {
        // Se for inteiro ele retorna o valor que ele pediu
        return parsedAmount as OneToNine;
    }
    // Se não for inteiro ou qualquer outra coisa ele returno nulo para a função que chamar o parseAmount verificar o resultado
    return null;
}



// Função que chama a função /cart no discord
export async function execute(interaction: ChatInputCommandInteraction) {

    // rawAmount = "Quantidade Crua", sem a função de verificação!
    const rawAmount = interaction.options.getString("quantidade");
    const parsedAmount = parseAmount(rawAmount);

    // Se o input for inválido ele retorna um erro de acordo com o retorno da função parsedAmount
    if (parsedAmount === null) {
        return interaction.reply({
            content: "Você precisa informar um número válido entre **1 e 9**.",
            ephemeral: true
        });
    }
    
    // Se não der erro ele roda a função normal
    const cards = drawPlayingCards(parsedAmount);

    await interaction.reply(
        `Você tirou as seguintes cartas:\n${cards.join("\n")}`
    );
}
