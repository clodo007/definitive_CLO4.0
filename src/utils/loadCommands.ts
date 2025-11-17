import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Interface que define como um comando deve ser
export interface LoadedCommand {
  data: SlashCommandBuilder; // Objeto que define o comando (nome, descrição, opções, etc)
  execute: (interaction: ChatInputCommandInteraction | undefined) => Promise<void>; // Função executada quando o comando é chamado
}
// Função que percorre recursivamente todas as pastas de comandos e retorna todos os comandos válidos
export async function loadAllCommands(commandsPath: string): Promise<LoadedCommand[]> {
  const commands: LoadedCommand[] = [];

  // Função interna que escaneia diretórios recursivamente
  async function scanAllCommandFiles(dir: string) {
    // Lê todos os arquivos e pastas dentro do diretório atual
    const commandEntries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of commandEntries) {
      const fullArchievePath = path.join(dir, entry.name); // Caminho completo do arquivo ou pasta
      if (entry.isDirectory()) {
        // Se for pasta, chama scan novamente
        await scanAllCommandFiles(fullArchievePath);
      } else if (entry.isFile() && (fullArchievePath.endsWith(".js") || fullArchievePath.endsWith(".ts"))) {
        // Se for arquivo JavaScript ou Type, importa usando URL do arquiv
        const fileUrl = pathToFileURL(fullArchievePath).href;
        const moduleInQuestion = await import(fileUrl);
        // Suporta tanto export default quanto export normal
        const commandInQuestion = moduleInQuestion.default ?? moduleInQuestion;
        // Verifica se o módulo tem "data" e "execute"
        if (commandInQuestion.data && commandInQuestion.execute) {
          // Adiciona na lista de comandos carregados
          commands.push(commandInQuestion);
        }
      }
    }
  }
  // Inicia o scan a partir do caminho principal de comandos
  await scanAllCommandFiles(commandsPath);
  // Retorna todos os comandos válidos encontrados
  return commands;
}
