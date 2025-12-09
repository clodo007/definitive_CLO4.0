import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { Category } from "../../schemas/categorySchema";
import { User } from "../../schemas/userSchema";

interface ActiveSession {
  startedAt: number;
  players: string[];
  categoryId: string;
  voiceChannelId: string;
}

export const activeSessions: Map<string, ActiveSession> = new Map();

export const data = new SlashCommandBuilder()
  .setName("sessao")
  .setDescription("Inicia uma Sessão para a sua Mesa")
  .addRoleOption((option) =>
    option.setName("mesa").setDescription("Role da mesa que deseja iniciar a sessão").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const mestre = interaction.member as GuildMember;
  const guild = interaction.guild!;
  const role = interaction.options.getRole("mesa");
  if (!role) return;

  // Busca a categoria da mesa pelo roleID
  const categoria = await Category.findOne({ guildID: guild.id, "campaignData.newRoleID": role.id });
  if (!categoria || !categoria.campaignData) {
    return interaction.reply({
      content: "⚠️ Não foi possível encontrar a mesa para essa role.",
      ephemeral: true,
    });
  }

  // Procura canal de voz da categoria
  const voiceChannel = guild.channels.cache.find((c) => c.parentId === categoria.categoryID && c.isVoiceBased()) as
    | VoiceChannel
    | undefined;

  if (!voiceChannel) {
    return interaction.reply({
      content: "⚠️ Não foi possível localizar o canal de voz da mesa.",
      ephemeral: true,
    });
  }

  // Verifica se o mestre está conectado
  if (!voiceChannel.members.has(mestre.id)) {
    return interaction.reply({
      content: "⚠️ Você precisa estar conectado ao canal de voz da mesa para iniciar a sessão.",
      ephemeral: true,
    });
  }

  // Verifica se já existe sessão ativa
  if (activeSessions.has(mestre.id)) {
    return interaction.reply({
      content: "🚫 Você já tem uma sessão ativa!",
      ephemeral: true,
    });
  }

  const players = categoria.campaignData.players || [];
  const cargoMesaId = categoria.campaignData.newRoleID;
  const generalChannelId = categoria.campaignData.generalChannelID;

  const generalChannel = guild.channels.cache.get(generalChannelId) as TextChannel;
  if (!generalChannel) {
    return interaction.reply({
      content: "❌ Não foi possível localizar o canal geral da mesa.",
      ephemeral: true,
    });
  }

  // Lista membros conectados no momento
  const connectedMembers = voiceChannel.members.filter((m) => !m.user.bot);
  const connectedList =
    connectedMembers.size > 0
      ? connectedMembers.map((m) => `<a:htg:1448033948876673134> <@${m.id}>`).join("\n")
      : "Nenhum jogador conectado no momento.";

  // Salva sessão enm
  activeSessions.set(mestre.id, {
    startedAt: Date.now(),
    players,
    categoryId: categoria.categoryID,
    voiceChannelId: voiceChannel.id,
  });

  const embed = new EmbedBuilder()
    .setColor("#00ff9d")
    .setTitle("<a:alert:1448056244396097689> Sessão Iniciada!")
    .setDescription(
      `A sessão da mesa **${categoria.name.replace(/^🟡/, "")}** foi iniciada pelo Mestre <@${mestre.id}>!\n\n` +
        `**Jogadores no momento que iniciou a sessão:**\n${connectedList}\n\n` +
        `<a:vch:1448058979367391304> **Canal de Voz:** <#${voiceChannel.id}>`
    )
    .setTimestamp();

  await generalChannel.send({
    content: `<@&${cargoMesaId}>`,
    embeds: [embed],
  });

  // Salva sessão no DB
  categoria.campaignData.sessions.push({
    date: new Date(),
    duration: 0,
    players,
    dadosRolados: 0,
    notes: "",
  });
  await categoria.save();

  // Atualiza stats de usuários
  const allParticipants = [...new Set([...players, mestre.id])];
  await User.updateMany({ userID: { $in: allParticipants }, guildID: guild.id }, { $inc: { mesasJogadas: 1 } });

  // DM para jogadores
  for (const playerId of players) {
    const user = await guild.members.fetch(playerId).catch(() => null);
    if (!user) continue;

    try {
      const dmEmbed = new EmbedBuilder()
        .setColor("#00ff9d")
        .setTitle("<a:alert:1448056244396097689> A sessão começou!")
        .setDescription(
          `A mesa **${categoria.name.replace(/^🟡/, "")}** acabou de iniciar sessão!\n\n` +
            `<a:vch:1448058979367391304> **Canal de voz:** <#${voiceChannel.id}>`
        )
        .setTimestamp();
      await user.send({ embeds: [dmEmbed] });
    } catch {
      // ignora caso usuário tenha aquelas preferencia de  DM privado
    }
  }

  return interaction.reply({
    content: "Sessão iniciada com sucesso!",
    ephemeral: true,
  });
}
