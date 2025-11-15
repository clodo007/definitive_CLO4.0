import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clientId, guildId, token } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

// Funcao que le, todos os comandos dentro de todas subpastas
// recebe uma direcao tipo string, e armazena todas numa Array
function readAllCommandFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readAllCommandFiles(fullPath));
    } else if (entry.isFile() && (fullPath.endsWith(".js") || fullPath.endsWith(".ts"))) {
      files.push(fullPath);
    }
  }

  return files;
}
const commandFiles = readAllCommandFiles(path.join(__dirname, "commands"));

// Iteraçao que pega e verifica comando por comando, se ele possui a propriedade
// "data" e "execute", se sim >  commands.push(command.data.toJSON());
// Codigo Default do Discord.js
for (const file of commandFiles) {
  const module = await import(file);

  const command: {
    data?: { toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody };
    execute?: (...args: unknown[]) => unknown;
  } = module.default ?? module;

  if (command.data && command.execute) {
    commands.push(command.data.toJSON());
  }
}
// Conecta se a api do discord
// Codigo Default do Discord.js
const rest = new REST().setToken(token);

// Carrega os comandos, e mostra eles em uma array no console
(async () => {
  const data = (await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commands,
  })) as RESTPostAPIChatInputApplicationCommandsJSONBody[];

  console.log(`Loaded ${[data]} commands`);
})();
