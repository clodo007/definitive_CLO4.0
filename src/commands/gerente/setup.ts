import { ChannelType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Category } from "../../schemas/categorySchema";
import { Role } from "../../schemas/rolesSchema";
import { User } from "../../schemas/userSchema";

export const data = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("Inicializa partes da base de dados do servidor.")
  .addSubcommand((sub) => sub.setName("roles").setDescription("Sincroniza os cargos do servidor."))
  .addSubcommand((sub) => sub.setName("users").setDescription("Sincroniza os usuários do servidor."))
  .addSubcommand((sub) => sub.setName("categories").setDescription("Sincroniza as categorias e canais do servidor."));

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild)
    return interaction.reply({
      content: "❌ Este comando só pode ser usado em um servidor.",
      ephemeral: true,
    });

  await interaction.deferReply({ ephemeral: true });
  const sub = interaction.options.getSubcommand();

  if (sub === "roles") {
    for (const role of guild.roles.cache.values()) {
      if (role.managed) continue;
      await Role.updateOne(
        { guildID: guild.id, roleID: role.id },
        {
          $set: {
            name: role.name,
            color: role.hexColor,
            createdAt: role.createdAt ?? new Date(),
          },
        },
        { upsert: true }
      );
    }
    await interaction.editReply({ content: "✅ Cargos sincronizados com sucesso!" });
  }

  if (sub === "users") {
    await guild.members.fetch();
    for (const member of guild.members.cache.values()) {
      if (member.user.bot) continue;
      await User.updateOne(
        { guildID: guild.id, userID: member.id },
        {
          $set: {
            username: member.user.username,
            joinedAt: member.joinedAt ?? new Date(),
            isActive: true,
          },
        },
        { upsert: true }
      );
    }
    await interaction.editReply({ content: "✅ Usuários sincronizados com sucesso!" });
  }

  if (sub === "categories") {
    const categories = guild.channels.cache.filter((c) => c.type === ChannelType.GuildCategory);
    for (const category of categories.values()) {
      const canais = guild.channels.cache
        .filter((ch) => ch.parentId === category.id)
        .map((ch) => ({
          channelID: ch.id,
          name: ch.name,
          type: ch.type === ChannelType.GuildVoice ? "voice" : ch.type === ChannelType.GuildText ? "text" : "thread",
        }));

      await Category.updateOne(
        { guildID: guild.id, categoryID: category.id },
        {
          $set: {
            name: category.name,
            channels: canais,
            createdAt: category.createdAt ?? new Date(),
          },
        },
        { upsert: true }
      );
    }
    await interaction.editReply({ content: "✅ Categorias sincronizadas com sucesso!" });
  }
}
