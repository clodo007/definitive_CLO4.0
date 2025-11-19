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

const tarotDeck: TarotCard[] = [
  { id: 0,  name: "O Louco",           imagePath: "assets/tarotDeck/00-louco.png" },
  { id: 1,  name: "O Mago",            imagePath: "assets/tarotDeck/01-mago.png" },
  { id: 2,  name: "A Sacerdotisa",     imagePath: "assets/tarotDeck/02-sacerdotisa.png" },
  { id: 3,  name: "A Imperatriz",      imagePath: "assets/tarotDeck/03-imperatriz.png" },
  { id: 4,  name: "O Imperador",       imagePath: "assets/tarotDeck/04-imperador.png" },
  { id: 5,  name: "O Hierofante",      imagePath: "assets/tarotDeck/05-hierofante.png" },
  { id: 6,  name: "Os Enamorados",     imagePath: "assets/tarotDeck/06-enamorados.png" },
  { id: 7,  name: "O Carro",           imagePath: "assets/tarotDeck/07-carro.png" },
  { id: 8,  name: "A Justiça",         imagePath: "assets/tarotDeck/08-justica.png" },
  { id: 9,  name: "O Eremita",         imagePath: "assets/tarotDeck/09-eremita.png" },
  { id: 10, name: "A Roda da Fortuna", imagePath: "assets/tarotDeck/10-roda-da-fortuna.png" },
  { id: 11, name: "A Força",           imagePath: "assets/tarotDeck/11-forca.png" },
  { id: 12, name: "O Enforcado",       imagePath: "assets/tarotDeck/12-enforcado.png" },
  { id: 13, name: "A Morte",           imagePath: "assets/tarotDeck/13-morte.png" },
  { id: 14, name: "A Temperança",      imagePath: "assets/tarotDeck/14-temperanca.png" },
  { id: 15, name: "O Diabo",           imagePath: "assets/tarotDeck/15-diabo.png" },
  { id: 16, name: "A Torre",           imagePath: "assets/tarotDeck/16-torre.png" },
  { id: 17, name: "A Estrela",         imagePath: "assets/tarotDeck/17-estrela.png" },
  { id: 18, name: "A Lua",             imagePath: "assets/tarotDeck/18-lua.png" },
  { id: 19, name: "O Sol",             imagePath: "assets/tarotDeck/19-sol.png" },
  { id: 20, name: "O Julgamento",      imagePath: "assets/tarotDeck/20-julgamento.png" },
  { id: 21, name: "O Mundo",           imagePath: "assets/tarotDeck/21-mundo.png" },
];

//Funções utilitárias

function parseQuantity(quantity: string | null): number | string {
  if (!quantity) return 1;

  const value = Number(quantity);

  if (!Number.isInteger(value) || value < 1 || value > 9) {
    return "Você deve informar um número inteiro entre **1 e 9**.";
  }

  return value;
}

function drawTarotCards(count: number): TarotCard[] {
  if (count > tarotDeck.length) {
    throw new Error("Quantidade solicitada maior que o número de cartas disponíveis.");
  }

  const deckCopy = [...tarotDeck];
  const result: TarotCard[] = [];

  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * deckCopy.length);
    const [card] = deckCopy.splice(index, 1);
    result.push(card);
  }

  return result;
}

//Slash Command

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
  const quantityRaw = interaction.options.getString("quantidade");
  const quantity = parseQuantity(quantityRaw);

  if (typeof quantity === "string") {
    await interaction.reply({
      content: quantity,
      ephemeral: true,
    });
    return;
  }

  const drawnCards = drawTarotCards(quantity);

  const results = drawnCards.map((card) => ({
    id: card.id,
    name: card.name,
    image: card.imagePath,
  }));

  const files = results.map((card) => {
    const fileName = path.basename(card.image);
    return new AttachmentBuilder(card.image).setName(fileName);
  });

  const embeds = results.map((card) => {
    const fileName = path.basename(card.image);

    return new EmbedBuilder()
      .setTitle(`Arcano ${card.id} – ${card.name}`)
      .setDescription(`Carta sorteada: **${card.name}**`)
      .setImage(`attachment://${fileName}`);
  });

  await interaction.reply({
    content:
      results.length === 1
        ? "Você tirou **1 carta de tarot**:"
        : `Você tirou **${results.length} cartas de tarot**:`,
    embeds,
    files,
  });
}
