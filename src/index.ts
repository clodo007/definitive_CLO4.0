import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import path from "node:path";
import { loadEvents } from "./file_system.js";
import { LoadedCommand, loadAllCommands } from "./utils/loadCommands.js";

dotenv.config();

// Extender Client para suportar comandos
declare module "discord.js" {
  interface Client {
    commands: Collection<string, LoadedCommand>;
  }
}

// Variáveis de ambiente
const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.CLIENT_ID!;
const guildId = process.env.GUILD_ID!;
const mongoUrl = process.env.MONGO_URL!;

// Cria client
export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages],
});

// Inicializa colecao de comandos
client.commands = new Collection();

// Conecta no MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(mongoUrl);
    console.log("🟢 Conectado ao MongoDB com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao conectar ao MongoDB:", err);
  }
}

// Evento ready
client.once(Events.ClientReady, (c) => {
  console.log(`🚀 Bot online como ${c.user.tag}`);
});

// Evento InteractionCreate
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      await interaction.reply({ content: "❌ Erro ao executar o comando!", ephemeral: true });
    }
  }
});

// Carrega comandos e eventos
(async () => {
  await connectToDatabase();
  const commandsPath = path.join(__dirname, "commands");
  const loadedCommands = await loadAllCommands(commandsPath);
  loadedCommands.forEach((c) => client.commands.set(c.data.name, c));

  await loadEvents(client);

  await client.login(token);
})();

// import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
// import * as dotenv from "dotenv";
// import path from "node:path";
// import { loadAllCommands, LoadedCommand } from "./utils/loadCommands.js"; // Função para carregar todos os comandos do utils

// dotenv.config();

// // Extende a interface Client para adicionar a propriedade commands
// // No JavaScript puro, isso nao e necessario, mas no TypeScript sim
// declare module "discord.js" {
//   interface Client {
//     commands: Collection<string, LoadedCommand>;
//   }
// }

// // Lugar aonde voce define suas variaveis de ambiente e exporta elas:
// const token = process.env.DISCORD_TOKEN;
// const clientId = process.env.CLIENT_ID as string;
// const guildId = process.env.GUILD_ID as string;

// // Cria um cliente novo como todas suas instancias, e intents
// const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// // Quando o cliente estiver pronto, rode isso uma vez
// client.once(Events.ClientReady, (readyClient) => {
//   console.log(`To Pronto! Logado como ${readyClient.user.tag}`);
// });

// // Evento que escuta qualquer interação
// client.on(Events.InteractionCreate, async (interaction) => {
//   // Verifica se a interação é um Chat Input Command (Slash Command)
//   if (!interaction.isChatInputCommand()) return;
//   const command = client.commands.get(interaction.commandName);
//   if (!command) return; // Não encontrou comando
//   try {
//     await command.execute(interaction);
//   } catch (error) {
//     console.error(error);

//     if (!interaction.replied) {
//       await interaction.reply({
//         content: "❌ Ocorreu um erro ao executar este comando!",
//         ephemeral: true,
//       });
//     }
//   }
// });

// // Inicializa a coleçao de comandos
// client.commands = new Collection();

// // Carrega todos os comandos usando a função loadCommands
// const commandsPath = path.join(__dirname, "commands");
// console.log(commandsPath);
// loadAllCommands(commandsPath).then((loadedCommands) => {
//   for (const command of loadedCommands) {
//     // seta o nome do comando, e seu id
//     client.commands.set(command.data.name, command);
//   }
// });

// // Log in no discord
// client.login(token);
