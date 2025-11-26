import {
  CategoryChannel,
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

// !!! IMPORTANT: Replace this with your actual category ID !!!
const TEMP_CATEGORY_ID = "1442551533131665489";

export const data = new SlashCommandBuilder()
  .setName("oneshot")
  .setDescription("Cria canais temporários com threads públicas")
  .addStringOption((option) =>
    option.setName("nome").setDescription("Nome para os canais e threads").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild;
  if (!guild) return;

  const nome = interaction.options.getString("nome", true);

  // Pega a categoria
  const category = guild.channels.cache.get(TEMP_CATEGORY_ID) as CategoryChannel;
  // Use ChannelType enum for clarity
  if (!category || category.type !== ChannelType.GuildCategory) {
    return interaction.reply({ content: "⚠️ Categoria temporária não encontrada.", ephemeral: true });
  }

  // Cria canal de texto
  const textChannel = await guild.channels.create({
    name: `🎯ᆞ${nome}`,
    type: ChannelType.GuildText, // Use ChannelType.GuildText
    parent: category.id,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] },
      {
        id: interaction.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageThreads],
      },
    ],
  });

  // Cria canal de voz
  const voiceChannel = await guild.channels.create({
    name: `🔊ᆞ${nome}`,
    type: ChannelType.GuildVoice, // Use ChannelType.GuildVoice
    parent: category.id,
    permissionOverwrites: [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.Connect, PermissionFlagsBits.ViewChannel] },
      {
        id: interaction.user.id,
        allow: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak, PermissionFlagsBits.ManageChannels],
      },
    ],
  });

  // Cria threads públicas fixas
  const threadNames = ["💬 Chat de Texto 💬", "📸 Imagens 📸", "🎲 Dados 🎲", "🎶 Musica 🎶"];
  for (const threadName of threadNames) {
    // --- FIX APPLIED HERE: Removed the 'as GuildTextThreadCreateOptions' cast ---
    await textChannel.threads.create({
      name: threadName,
      autoArchiveDuration: 1440, // 24 horas
      type: ChannelType.PublicThread, // Use ChannelType.PublicThread (11)
      reason: `Threads do canal temporário ${nome}`,
    });
  }

  // Responde ao usuário
  await interaction.reply({
    content: `✅ Canais temporários criados com sucesso! Eles serão deletados em 24 horas.`,
    ephemeral: true,
  });

  // Agenda deleção em 24 horas
  setTimeout(async () => {
    try {
      if (textChannel.deletable) await textChannel.delete().catch(() => {});
      if (voiceChannel.deletable) await voiceChannel.delete().catch(() => {});
    } catch (err) {
      console.error("Erro ao deletar canais temporários:", err);
    }
  }, 24 * 60 * 60 * 1000); // 24 horas
}
