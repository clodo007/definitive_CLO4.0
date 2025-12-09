import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const ROLES = {
  hospede: "1429534864994205837",
  mestre: "1428796956536340541",
  staff: "1429071033285218324",
};

export const data = new SlashCommandBuilder()
  .setName("ajuda")
  .setDescription("Mostra os comandos disponíveis do Bot");

async function getCommandsFromFolder(folder: string, type?: "gerais" | "mestre" | "gerente"): Promise<string> {
  const commandsPath = path.join(process.cwd(), "src", "commands", folder);
  if (!fs.existsSync(commandsPath)) return "Nenhum comando";

  const commandFiles = fs.readdirSync(commandsPath).filter(
    f => f.endsWith(".ts") && f !== "verificacaoDeCargo.ts"
  );
  const commands: string[] = [];

  for (const file of commandFiles) {
    try {
      const filePath = path.join(commandsPath, file);
      const mod = await import(pathToFileURL(filePath).href);
      if (!mod?.data) continue;
      const json = mod.data.toJSON();
      commands.push(`/${json.name} - ${json.description}`);
    } catch (err) {
      console.error(`Erro ao carregar comando ${file}:`, err);
    }
  }

  if (!commands.length) return "Nenhum comando";

  let lang = "";
  if (type === "gerais") lang = "ini";
  if (type === "mestre") lang = "prolog";
  if (type === "gerente") lang = "ml";

  return `\`\`\`${lang}\n${commands.join("\n")}\n\`\`\``;
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const member = await interaction.guild!.members.fetch(interaction.user.id);
  const embeds: EmbedBuilder[] = [];
  const files: AttachmentBuilder[] = [];

  if (member.roles.cache.has(ROLES.hospede)) {
    const icon = new AttachmentBuilder(path.join(process.cwd(), "src/assets/iconsForEmbedds/hospede.png")).setName("hospede.png");
    files.push(icon);
    embeds.push(
      new EmbedBuilder()
        .setTitle("<a:glb:1448041953676759040> Comandos Públicos")
        .setColor("Blue")
        .setDescription(`Comandos disponíveis para todos os membros.\n\n${await getCommandsFromFolder("gerais", "gerais")}`)
        .setThumbnail("attachment://hospede.png")
    );
  }

  if (member.roles.cache.has(ROLES.mestre)) {
    const icon = new AttachmentBuilder(path.join(process.cwd(), "src/assets/iconsForEmbedds/mestre.png")).setName("mestre.png");
    files.push(icon);
    embeds.push(
      new EmbedBuilder()
        .setTitle("<a:mag:1448034126207909978> Comandos de Mestre")
        .setColor("Yellow")
        .setDescription(`Exclusivos para <@&${ROLES.mestre}>.\n\n${await getCommandsFromFolder("mestre", "mestre")}`)
        .setThumbnail("attachment://mestre.png")
    );
  }

  if (member.roles.cache.has(ROLES.staff)) {
    const icon = new AttachmentBuilder(path.join(process.cwd(), "src/assets/iconsForEmbedds/staff.png")).setName("staff.png");
    files.push(icon);
    embeds.push(
      new EmbedBuilder()
        .setTitle("<a:hmr:1448034057253294162> Comandos de Staff")
        .setColor("Red")
        .setDescription(`Exclusivos para <@&${ROLES.staff}>.\n\n${await getCommandsFromFolder("gerente", "gerente")}`)
        .setThumbnail("attachment://staff.png")
    );
  }

  if (!embeds.length) {
    return interaction.reply({ content: "❌ Você não possui cargos para acessar comandos.", ephemeral: true });
  }

  await interaction.reply({ embeds, files, ephemeral: true });
}
