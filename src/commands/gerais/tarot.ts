import { AttachmentBuilder, ChatInputCommandInteraction, Embed, EmbedBuilder, Options, SlashCommandBuilder } from "discord.js";
import { fileURLToPath } from "url";
import path from "node:path";

//Tipagem do Array de cartas
interface TarotCard {
  id: number;
  name: string;
  imagePath: string;
}

// Tipagem para o valor passado em "amount"
type OneToNine = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

// Aqui ele pega o nome correto da pasta que você está para conseguir buscar os assets
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tarotDeck: TarotCard[] = [
  { id: 0, name: "O Louco", imagePath: "assets/tarotDeck/00-louco.png" },
  { id: 1, name: "O Mago", imagePath: "assets/tarotDeck/01-mago.png" },
  { id: 2, name: "A Sacerdotisa", imagePath: "assets/tarotDeck/02-sacerdotisa.png" },
  { id: 3, name: "A Imperatriz", imagePath: "assets/tarotDeck/03-imperatriz.png" },
  { id: 4, name: "O Imperador", imagePath: "assets/tarotDeck/04-imperador.png" },
  { id: 5, name: "O Hierofante", imagePath: "assets/tarotDeck/05-hierofante.png" },
  { id: 6, name: "Os Enamorados", imagePath: "assets/tarotDeck/06-enamorados.png" },
  { id: 7, name: "O Carro", imagePath: "assets/tarotDeck/07-carro.png" },
  { id: 8, name: "A Justiça", imagePath: "assets/tarotDeck/08-forca.png" },
  { id: 9, name: "O Eremita", imagePath: "assets/tarotDeck/09-eremita.png" },
  { id: 10, name: "A Roda da Fortuna", imagePath: "assets/tarotDeck/10-roda-da-fortuna.png" },
  { id: 11, name: "A Força", imagePath: "assets/tarotDeck/11-justica.png" },
  { id: 12, name: "O Enforcado", imagePath: "assets/tarotDeck/12-enforcado.png" },
  { id: 13, name: "A Morte", imagePath: "assets/tarotDeck/13-morte.png" },
  { id: 14, name: "A Temperança", imagePath: "assets/tarotDeck/14-temperanca.png" },
  { id: 15, name: "O Diabo", imagePath: "assets/tarotDeck/15-diabo.png" },
  { id: 16, name: "A Torre", imagePath: "assets/tarotDeck/16-torre.png" },
  { id: 17, name: "SUTÃ PURACHINA", imagePath: "assets/tarotDeck/17-estrela.png" },
  { id: 18, name: "A Lua", imagePath: "assets/tarotDeck/18-lua.png" },
  { id: 19, name: "O Sol", imagePath: "assets/tarotDeck/19-sol.png" },
  { id: 20, name: "O Julgamento", imagePath: "assets/tarotDeck/20-julgamento.png" },
  { id: 21, name: "ZA WÃRUDO", imagePath: "assets/tarotDeck/21-mundo.png" },
];

// Build do comando /tarot
export const data = new SlashCommandBuilder()
  .setName('tarot')
  .setDescription('Gerar cartas de Tarpt! Preveja sua sorte.')
  .addStringOption(options => (
    options
      .setName('quantidade')
      .setDescription('Escolha um valor de 1 a 9!')
      .setRequired(false)
  ))
// Função que gera a carta de tarot buscando no array definido a cima
function generateTarotCard() {
  const randomNumber = Math.floor(Math.random() * tarotDeck.length)
  const generatedCard = tarotDeck[randomNumber]

  return generatedCard
}

// Função que "compra" as cartas e organiza para não se repitirem
function drawTarotCards(amountOfDraws: OneToNine = 1): TarotCard[] {
  // cria um objeto SET de array baseado no TarotCard e faz um loop para adicionar as cartas sem repetilas
  const uniqueTarotCardResult = new Set<TarotCard>()
  while (uniqueTarotCardResult.size < amountOfDraws) {
    uniqueTarotCardResult.add(generateTarotCard())
  }

  return [...uniqueTarotCardResult]
}

// Aqui é uma função para formatar o valor passado pelo usuário no discord e não correr o risco de alguém passar por exemplo: "true" e bugar todo o código
function parseAmount(amountOfDraws: string | null): OneToNine | null {
  // Se o valor não for passado ele sempre retorna 1
  if (!amountOfDraws) return 1;
  // Se for passado o valor ele verifica se está correto e faz a formatação de acordo com a tipagem passada OneToNine definida a cima
  const parsedAmountOfDraws = Number(amountOfDraws)
  if (Number.isInteger(parsedAmountOfDraws) && parsedAmountOfDraws >= 1 && parsedAmountOfDraws <= 9) {
    return parsedAmountOfDraws as OneToNine;
  }
  return null;
}

// Espera o usuário digitar o comando /tarot para mostrar o resultado
export async function execute(interaction: ChatInputCommandInteraction) {
  // Pega a quantidade passada pelo usuário no discord
  const rawAmountOfDraw = interaction.options.getString("quantidade");
  // Joga para a formatação
  const parsedAmountOfDraws = parseAmount(rawAmountOfDraw);

  // Se for uma formatação incorreta ele mostra um erro para o usuário
  if (parsedAmountOfDraws === null) {
    return interaction.reply({
      content: "Você precisa informar um número entre **1 e 9**.",
      ephemeral: true,
    });
  }
  // Caso não tenha nenhum erro com a formatação ai sim ele gera as cartas
  const cards = drawTarotCards(parsedAmountOfDraws);

  // Array de "telas" para mostrar as imagens e descrição
  const embeds: EmbedBuilder[] = []
  // Array para adicionar as imagens nos assets sorteadas
  const files: AttachmentBuilder[] = [];
  

  // Faz um for para "destrinchar" o objeto e separar tudo certinho
  for (const card of cards) {

    // Aqui ele pega o caminho do objeto e adiciona ao filePath, note que se o caminho estiver incorreto ao do TarotCard e Assets ele irá dar erro aqui
    const filePath = path.join(__dirname, "..", "..", card.imagePath);
    // Com o caminho certo, ai ele usa o AttachmentBuilder para setar a imagem
    const attachment = new AttachmentBuilder(filePath).setName(
      path.basename(card.imagePath)
    );
    // Adiciona ao array de files a imagem
    files.push(attachment);

    // // Cria a "tela" para colocar as informações de cada imagem, Caso queira essa função só descomentar o trecho abaixo

    // const embed = new EmbedBuilder()
    // .setTitle("TAROT CARDS")
    // .setColor("DarkPurple")
    // .setDescription(`**${card.name}** - ${card.id}`)
    // .setImage(`attachment://${path.basename(card.imagePath)}`);
    
    // // Adiciona ao array 
    // embeds.push(embed)
   
  }
  // Por fim, mostra na tela do discord as imagens com a variável embed
  return interaction.reply({
     files,
  });
}




