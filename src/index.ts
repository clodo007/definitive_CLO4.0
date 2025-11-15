import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import fs from "node:fs";
import path from "node:path";

// Extende a interface Client para adicionar a propriedade commands
// No JavaScript puro, isso nao e necessario, mas no TypeScript sim
declare module "discord.js" {
  interface Client {
    commands: Collection<string, any>;
  }
}

// Lugar aonde voce define suas variaveis de ambiente e exporta elas:
export const token = process.env.DISCORD_TOKEN as string;
export const clientId = process.env.CLIENT_ID as string;
export const guildId = process.env.GUILD_ID as string;
// Cria um cliente novo como todas suas instancias, e intents
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// Quando o cliente estiver pronto, rode isso uma vez
client.once(Events.ClientReady, (readyClient) => {
  console.log(`To Pronto! Logado como ${readyClient.user.tag}`);
});
client.on(Events.InteractionCreate, (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  console.log(interaction);
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

// Log in to Discord with your client's token
client.login(token);
