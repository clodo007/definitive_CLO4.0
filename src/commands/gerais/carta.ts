import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { arrayDeDados } from "../../data.js" //Criei um "banco de dados" em JSON para não poluir o código e fazer alterações sem ter que mudar código base;

// O bot irá rodar o comando ao colocar /carta ou /carta quantidade
export const data = new SlashCommandBuilder()
    .setName('carta')
    .setDescription('Esse comando irá gerar cartas de baralho')
    .addStringOption(option =>
        option
        .setName('quantidade')
        .setDescription('Quantas cartas você quer puxar? (1 a 9)')
        .setRequired(false)
        // Aqui são aquelas opções que aparece quando você usa o "/"
    );

// Acessa o Objeto Baralho no JSON data.js e pega o Naipe e Valores do baralho
const baralho = arrayDeDados.BaralhoDeCartas[0]

// Essa é a função que gera as cartas
function gerarCartas() {

    // Aqui a carta é gerada da seguinte forma; Com os valores predefinidos no objeto geramos um valor aleatório para 
    // acessar esses valore predefinos e gerar a Carta com o Valor e Naipe
    //Math Floor para arredondar para cima quando colocar um valor decimal e o MathRandom para pegar um valor aleatório dentro do array predefinido
    const cartaGerada = baralho.ValoresDasCartas[Math.floor(Math.random() * baralho.ValoresDasCartas.length)] +
        baralho.Naipes[Math.floor(Math.random() * baralho.Naipes.length)]
    //Retorna a carta gerada
    return cartaGerada
}

// Essa função é responsável por mostrar qual foi a carta gerada a pedido do usuário
function gerarCartasDeBaralho(quantidade?: string) {

    //Caso a pessoa passa um valor Booleano
    if (typeof quantidade !== "string") {
        return "Você precisa enviar somente números";
    }

    const resultadosDasCartas: string[] = [] // O Array que vai conter as multiplas cartas se solicitado
    const quantidadeFormatada = Number(quantidade) // Como o valor passado sempre vai ser um string, preciamos converter para Number para fazer as comparações corretamente!

    // Verifica se a string que ela passou realmente é um número, no caso ao converter ele irá retorna NaN e cairá nesse IF
    if (Number.isNaN(quantidadeFormatada)) {
        return 'Você precisa informar um número válido.';
    }

    // Caso a pessoa não passe nenhum valor, o bot retorna uma carta
    if (!quantidade) {
        resultadosDasCartas.push(gerarCartas());
        return resultadosDasCartas
    }

    // Se o valor colocado for inválido
    if (quantidadeFormatada > 9 || quantidadeFormatada < 0) {
        return 'A quantidade de cartas escolhidas não pode ser maior que 9 ou menor que 0'
    }

    // Esse for faz a lógica para verificar se a carta gerada já está contido no array para não permirtir ser inserido novamente!
    for (let i = 0; i < quantidadeFormatada; i++) {
        const carta = gerarCartas()
        // Se a carta gerada já existir ele entra no if e gera uma nova
        if (resultadosDasCartas.includes(carta)) {

            const carta = gerarCartas()
            resultadosDasCartas.push(carta)

        } else {
            // Aqui adiciona a carta gerada
            resultadosDasCartas.push(carta)
        }
    }

    return resultadosDasCartas

}

export async function execute(interaction: ChatInputCommandInteraction) {

    // Aqui ele pega o que o usuário digitou na opção quantidade de /carta quantidade:
    // Se não passar nada ele vira default = 1 e gera uma carta
   const quantidade = interaction.options.getString("quantidade") ?? undefined
   const resultado = gerarCartasDeBaralho(quantidade);

   // Aqui é o seguinte, a função gerarCartasDeBaralho retorna uma String normal e um Array de string []:String, essa verificação é utilizada
   // Para verificar se o retorno do resultado foi um []:String pois o metodo ".join()" apenas funciona em arrays e deixar sem essa verificação
   // da um erro quando o resultado retornar uma String, além disso o ephemeral faz com quem apenas o usuário que solicitou o comando veja a mensagem!
    if (!Array.isArray(resultado)) {
        return interaction.reply({ content: resultado, ephemeral: true });
    }

    // Aqui ele apenas retorna o valor gerados normalmente
    await interaction.reply(`Você tirou as seguintes cartas:\n ${resultado.join("\n")}`);
}