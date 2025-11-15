import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("Nome_do_Comando")
  .setDescription("Descriçao_do_Comando")
  .addStringOption((option) =>
    option.setName("nome da option caso tenha").setDescription("descriçao da option").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.reply("Pong!");
}
