import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import path from "node:path";

interface TarotCard {
  id: number;
  name: string;
  imagePath: string;
}

const tarotDeck: TarotCard[] = [
  { id: 0, name: "O Louco", imagePath: "assets/tarotDeck/00-louco.png" },
  { id: 1, name: "O Mago", imagePath: "assets/tarotDeck/01-mago.png" },
  { id: 2, name: "A Sacerdotisa", imagePath: "assets/tarotDeck/02-sacerdotisa.png" },
  { id: 3, name: "A Imperatriz", imagePath: "assets/tarotDeck/03-imperatriz.png" },
  { id: 4, name: "O Imperador", imagePath: "assets/tarotDeck/04-imperador.png" },
  { id: 5, name: "O Hierofante", imagePath: "assets/tarotDeck/05-hierofante.png" },
  { id: 6, name: "Os Enamorados", imagePath: "assets/tarotDeck/06-enamorados.png" },
  { id: 7, name: "O Carro", imagePath: "assets/tarotDeck/07-carro.png" },
  { id: 8, name: "A Justiça", imagePath: "assets/tarotDeck/08-justica.png" },
  { id: 9, name: "O Eremita", imagePath: "assets/tarotDeck/09-eremita.png" },
  { id: 10, name: "A Roda da Fortuna", imagePath: "assets/tarotDeck/10-roda-da-fortuna.png" },
  { id: 11, name: "A Força", imagePath: "assets/tarotDeck/11-forca.png" },
  { id: 12, name: "O Enforcado", imagePath: "assets/tarotDeck/12-enforcado.png" },
  { id: 13, name: "A Morte", imagePath: "assets/tarotDeck/13-morte.png" },
  { id: 14, name: "A Temperança", imagePath: "assets/tarotDeck/14-temperanca.png" },
  { id: 15, name: "O Diabo", imagePath: "assets/tarotDeck/15-diabo.png" },
  { id: 16, name: "A Torre", imagePath: "assets/tarotDeck/16-torre.png" },
  { id: 17, name: "A Estrela", imagePath: "assets/tarotDeck/17-estrela.png" },
  { id: 18, name: "A Lua", imagePath: "assets/tarotDeck/18-lua.png" },
  { id: 19, name: "O Sol", imagePath: "assets/tarotDeck/19-sol.png" },
  { id: 20, name: "O Julgamento", imagePath: "assets/tarotDeck/20-julgamento.png" },
  { id: 21, name: "O Mundo", imagePath: "assets/tarotDeck/21-mundo.png" },
];

//Funções utilitárias

function parseQuantityOfTarotCards(quantity: string | null): number | string {
  if (!quantity) return 1;

  const valueOfUserInput = Number(quantity);

  if (!Number.isInteger(valueOfUserInput) || valueOfUserInput < 1 || valueOfUserInput > 9) {
    return "Você deve informar um número inteiro entre **1 e 9**.";
  }

  return valueOfUserInput;
}

function drawTarotCards(cardCount: number): TarotCard[] {
  if (cardCount > tarotDeck.length) {
    throw new Error("Quantidade solicitada maior que o número de cartas disponíveis.");
  }

  const copyOfTheTarotDeckArray = [...tarotDeck];
  const resultOfTheSorting: TarotCard[] = [];

  for (let i = 0; i < cardCount; i++) {
    const index = Math.floor(Math.random() * copyOfTheTarotDeckArray.length);
    const [cardFromTheDeck] = copyOfTheTarotDeckArray.splice(index, 1);
    resultOfTheSorting.push(cardFromTheDeck);
  }

  return resultOfTheSorting;
}

//Slash Command

export const data = new SlashCommandBuilder()
  .setName("tarot")
  .setDescription("Tira cartas de tarot só os arcanos maiores.")
  .addStringOption((option) =>
    option.setName("quantidade").setDescription("Tira até 9 cartas de vez.").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const quantityTheUserHasInput = interaction.options.getString("quantidade");
  const quantityParsed = parseQuantityOfTarotCards(quantityTheUserHasInput);

  if (typeof quantityParsed === "string") {
    await interaction.reply({
      content: quantityParsed,
      ephemeral: true,
    });
    return;
  }

  const drawnCards = drawTarotCards(quantityParsed);

  const resultsOfDrawnCards = drawnCards.map((card) => ({
    id: card.id,
    name: card.name,
    image: card.imagePath,
  }));

  const filesOfTheDrawnCards = resultsOfDrawnCards.map((card) => {
    const fileNameOfTheDrawnCards = path.basename(card.image);
    return new AttachmentBuilder(card.image).setName(fileNameOfTheDrawnCards);
  });

  const embeds = resultsOfDrawnCards.map((card) => {
    const fileName = path.basename(card.image);

    return new EmbedBuilder()
      .setTitle(`Arcano ${card.id} – ${card.name}`)
      .setDescription(`Carta sorteada: **${card.name}**`)
      .setImage(`attachment://${fileName}`);
  });

  await interaction.reply({
    content:
      resultsOfDrawnCards.length === 1
        ? "Você tirou **1 carta de tarot**:"
        : `Você tirou **${resultsOfDrawnCards.length} cartas de tarot**:`,
    embeds,
    files: filesOfTheDrawnCards,
  });
}
