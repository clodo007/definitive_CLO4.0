import { CacheType, ChatInputCommandInteraction, Client, SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

export interface CommandExport {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction<CacheType>) => Promise<void>;
}

export async function forEachCommand(callback: (commandModule: CommandExport) => void) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.resolve(__filename, "..");
  const commandsDir = path.join(__dirname, "commands");
  const folders = fs.readdirSync(commandsDir);

  for (const folder of folders) {
    const folderPath = path.join(commandsDir, folder);
    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".ts"));

    for (const file of files) {
      if (file === "verificacaoDeCargos.ts") continue;

      const modulePath = path.join(folderPath, file);
      const commandModule: CommandExport = await import(pathToFileURL(modulePath).href);
      if (commandModule?.data && typeof commandModule?.execute === "function") callback(commandModule);
      else console.log(`[WARNING] Comando inválido em ${modulePath}`);
    }
  }
}

export async function loadEvents(client: Client) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const eventsPath = path.join(__dirname, "events");

  const eventFiles = fs
    .readdirSync(eventsPath, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? fs.readdirSync(path.join(eventsPath, entry.name)).map((f) => path.join(entry.name, f))
        : [entry.name]
    )
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

  for (const file of eventFiles) {
    const fullPath = path.join(eventsPath, file);
    const eventModule = await import(pathToFileURL(fullPath).href);
    const event = eventModule.default;
    if (!event?.name || !event?.execute) continue;

    if (event.once) client.once(event.name, (...args) => event.execute(...args));
    else client.on(event.name, (...args) => event.execute(...args));

    console.log(`❕ Evento carregado: ${path.basename(fullPath)}`);
  }

  console.log("✅ Todos os eventos carregados com sucesso.");
}
