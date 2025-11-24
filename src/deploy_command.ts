import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv";
import path from "node:path";
import { loadAllCommands } from "./utils/loadCommands.js";

dotenv.config();

const token = process.env.DISCORD_TOKEN!;
const clientId = process.env.CLIENT_ID!;
const guildId = process.env.GUILD_ID!;

(async () => {
  const commandsPath = path.join(__dirname, "commands");
  const loaded = await loadAllCommands(commandsPath);

  const body = loaded.map((c) => c.data.toJSON());

  const rest = new REST().setToken(token);

  console.log("⏳ Registrando comandos...");

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });

  console.log(`\n☑️ ${body.length} comandos registrados com sucesso:\n`);

  for (const command of body) {
    console.log(`✔️  /${command.name}`);
  }

  console.log();
})();
