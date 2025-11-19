import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  AttachmentBuilder,
  EmbedBuilder,
} from "discord.js";
import path from "node:path";

interface TarotCard {
  id: number;        
  name: string;      
  imagePath: string;
}

// Baralho de Tarot – Arcanos Maiores
// As imagens devem estar em: assets/tarotBaralho
// Ajuste os nomes dos arquivos conforme os nomes das suas imagens.
const tarotDeck: TarotCard[] = [
  { id: 0,  name: "O Louco",           imagePath: "assets/tarotBaralho/00-louco.png" },
  { id: 1,  name: "O Mago",            imagePath: "assets/tarotBaralho/01-mago.png" },
  { id: 2,  name: "A Sacerdotisa",     imagePath: "assets/tarotBaralho/02-sacerdotisa.png" },
  { id: 3,  name: "A Imperatriz",      imagePath: "assets/tarotBaralho/03-imperatriz.png" },
  { id: 4,  name: "O Imperador",       imagePath: "assets/tarotBaralho/04-imperador.png" },
  { id: 5,  name: "O Hierofante",      imagePath: "assets/tarotBaralho/05-hierofante.png" },
  { id: 6,  name: "Os Enamorados",     imagePath: "assets/tarotBaralho/06-enamorados.png" },
  { id: 7,  name: "A Carruagem",       imagePath: "assets/tarotBaralho/07-carro.png" },
  { id: 8,  name: "A Força",           imagePath: "assets/tarotBaralho/08-forca.png" },
  { id: 9,  name: "O Eremita",         imagePath: "assets/tarotBaralho/09-eremita.png" },
  { id: 10, name: "A Roda da Fortuna", imagePath: "assets/tarotBaralho/10-roda-da-fortuna.png" },
  { id: 11, name: "A Justiça",         imagePath: "assets/tarotBaralho/11-justica.png" },
  { id: 12, name: "O Enforcado",       imagePath: "assets/tarotBaralho/12-enforcado.png" },
  { id: 13, name: "A Morte",           imagePath: "assets/tarotBaralho/13-morte.png" },
  { id: 14, name: "A Temperança",      imagePath: "assets/tarotBaralho/14-temperanca.png" },
  { id: 15, name: "O Diabo",           imagePath: "assets/tarotBaralho/15-diabo.png" },
  { id: 16, name: "A Torre",           imagePath: "assets/tarotBaralho/16-torre.png" },
  { id: 17, name: "A Estrela",         imagePath: "assets/tarotBaralho/17-estrela.png" },
  { id: 18, name: "A Lua",             imagePath: "assets/tarotBaralho/18-lua.png" },
  { id: 19, name: "O Sol",             imagePath: "assets/tarotBaralho/19-sol.png" },
  { id: 20, name: "O Julgamento",      imagePath: "assets/tarotBaralho/20-julgamento.png" },
  { id: 21, name: "O Mundo",           imagePath: "assets/tarotBaralho/21-mundo.png" },
];

// --------- Funções utilitárias ---------

function parseQuantidade(quantidade: string | null): number | string {
  if (!quantidade) {
    return 1; // /tarot sem option => 1 carta
  }

  const valor = Number(quantidade);

  if (!Number.isInteger(valor) || valor < 1 || valor > 9) {
    return "Você deve informar um número inteiro entre **1 e 9**.";
  }

  return valor;
}

function drawTarotCards(count: number): TarotCard[] {
  if (count > tarotDeck.length) {
    throw new Error("Quantidade solicitada maior que o número de cartas disponíveis.");
  }

  const deck = [...tarotDeck];
  const resultado: TarotCard[] = [];

  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * deck.length);
    const [card] = deck.splice(index, 1);
    resultado.push(card);
  }

  return resultado;
}

// --------- Slash Command ---------

export const data = new SlashCommandBuilder()
  .setName("tarot")
  .setDescription("Tira cartas de tarot (arcanos maiores).")
  .addStringOption((option) =>
    option
      .setName("quantidade")
      .setDescription("Quantidade de cartas (1 a 9). Se não informar, tira 1 carta.")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const quantidadeRaw = interaction.options.getString("quantidade");
  const quantidade = parseQuantidade(quantidadeRaw);

  if (typeof quantidade === "string") {
    await interaction.reply({
      content: quantidade,
      ephemeral: true,
    });
    return;
  }

  const cartasSorteadas = drawTarotCards(quantidade);

  const resultados = cartasSorteadas.map((carta) => ({
    id: carta.id,
    nome: carta.name,
    imagem: carta.imagePath,
  }));

  const files = resultados.map((carta) => {
    const fileName = path.basename(carta.imagem);
    return new AttachmentBuilder(carta.imagem).setName(fileName);
  });

  const embeds = resultados.map((carta) => {
    const fileName = path.basename(carta.imagem);

    return new EmbedBuilder()
      .setTitle(`Arcano ${carta.id} – ${carta.nome}`)
      .setDescription(`Carta sorteada: **${carta.nome}**`)
      .setImage(`attachment://${fileName}`);
  });

  await interaction.reply({
    content:
      resultados.length === 1
        ? "Você tirou **1 carta de tarot**:"
        : `Você tirou **${resultados.length} cartas de tarot**:`,
    embeds,
    files,
  });
}



