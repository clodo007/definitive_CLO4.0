import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ForumChannel,
  SlashCommandBuilder,
  ThreadChannel,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("repostar")
  .setDescription("Repostar seu post de fórum para notificar membros");

export async function execute(interaction: ChatInputCommandInteraction) {
  // Ensure we are in a guild context and the channel is a valid ThreadChannel
  if (
    !interaction.guild ||
    !interaction.channel ||
    !(interaction.channel.type === 11 || interaction.channel.type === 12)
  ) {
    // 11 = PublicThread, 12 = PrivateThread
    return interaction.reply({ content: "⚠️ Comando só pode ser usado dentro de um post de fórum.", ephemeral: true });
  }

  const thread = interaction.channel as ThreadChannel;

  // Only the post author can use this command (or an admin, which is handled by default permissions if you set them up)
  if (thread.ownerId !== interaction.user.id) {
    return interaction.reply({ content: "🚫 Você só pode repostar posts que criou.", ephemeral: true });
  }

  // Pega o canal pai do thread (que deve ser um fórum)
  const forumChannel = thread.parent;
  if (!forumChannel || !(forumChannel instanceof ForumChannel)) {
    return interaction.reply({ content: "⚠️ Não foi possível encontrar o canal do fórum pai.", ephemeral: true });
  }

  // --- FIX APPLIED HERE ---
  // Get the *currently applied* tag IDs for this specific thread.
  const appliedTagIds = thread.appliedTags;

  // Map those IDs to their actual names using the parent forum's definition of available tags.
  const appliedTagNames: string[] = appliedTagIds
    .map((tagId) => {
      // Find the tag object in the forum's availableTags list
      const tag = forumChannel.availableTags.find((t) => t.id === tagId);
      return tag?.name; // Returns name or undefined
    })
    .filter(Boolean) as string[]; // Filter out undefined/null entries and cast back to string[]

  if (appliedTagNames.length === 0) {
    return interaction.reply({ content: "⚠️ Este post não possui tags aplicadas.", ephemeral: true });
  }

  // --- Proceed with the notification logic ---

  // Build the embed from the last message attachments, if available
  const lastMessage = await thread.messages
    .fetch({ limit: 1 })
    .then((msgs) => msgs.first())
    .catch(() => null);
  const imageUrl = lastMessage?.attachments.first()?.url;

  const embed = new EmbedBuilder()
    .setTitle(thread.name)
    .setDescription(`Confira este post no canal <#${thread.id}>!`) // Link directly to the thread
    .setTimestamp();

  if (imageUrl) {
    embed.setImage(imageUrl);
  }

  const notifiedUsers = new Set<string>();
  let count = 0;
  const guild = interaction.guild!; // We know guild exists

  // Iterate over all relevant role names
  for (const tagName of appliedTagNames) {
    // Find the role in the guild by name
    const role = guild.roles.cache.find((r) => r.name === tagName);

    if (!role) continue;

    // Iterate over all members who have this role
    for (const [memberId, member] of role.members) {
      if (member.user.bot) continue;
      if (notifiedUsers.has(memberId)) continue;

      try {
        // Send a direct message
        await member.send({ content: `Talvez este post te interesse na mesa ${guild.name}:`, embeds: [embed] });
        notifiedUsers.add(memberId);
        count++;
      } catch (error) {
        // Ignore failure if user has DMs disabled or bot is blocked
        // console.error(`Could not DM member ${member.user.tag}:`, error);
      }
    }
  }

  return interaction.reply({
    content: `Post repostado! Notificações enviadas para ${count} membros que possuem as tags ${appliedTagNames.join(
      ", "
    )}.`,
    ephemeral: true,
  });
}
