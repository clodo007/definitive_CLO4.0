import { Client, EmbedBuilder, Events, TextChannel, VoiceChannel, VoiceState } from "discord.js";
import { activeSessions } from "../../commands/mestre/sessao";
import { Category } from "../../schemas/categorySchema";
import { User } from "../../schemas/userSchema";

export default {
  name: Events.VoiceStateUpdate,
  once: false,

  async execute(oldState: VoiceState, newState: VoiceState, client: Client) {
    const guild = oldState.guild || newState.guild;
    if (!guild) return;

    const channelToCheck = oldState.channel;
    if (!channelToCheck) return;

    const matchingSession = Array.from(activeSessions.entries()).find(
      ([, session]) => session.voiceChannelId === channelToCheck.id
    );
    if (!matchingSession) return;

    const [mestreId, session] = matchingSession;

    // Pega o canal de voz pelo cache da guild
    const voiceChannel = guild.channels.cache.get(session.voiceChannelId);
    if (!voiceChannel || !(voiceChannel instanceof VoiceChannel)) {
      activeSessions.delete(mestreId);
      return;
    }

    // Pega apenas jogadores que nao sao bots
    const humanMembers = voiceChannel.members.filter((m) => !m.user.bot);

    // Se ainda houver alguém, não encerra
    if (humanMembers.size > 0) return;

    // Sessão acabou
    const endTime = new Date();
    const durationMs = endTime.getTime() - session.startedAt;
    const durationHours = durationMs / 1000 / 60 / 60;
    const durationMinutes = (durationMs / 1000 / 60).toFixed(0);

    let categoryDoc;
    try {
      categoryDoc = await Category.findOne({ categoryID: session.categoryId });
      if (!categoryDoc || !categoryDoc.campaignData) {
        activeSessions.delete(mestreId);
        return;
      }

      // Salva sessão no DB
      categoryDoc.campaignData.sessions.push({
        date: session.startedAt,
        duration: durationHours,
        players: session.players,
        dadosRolados: 0,
        notes: "",
        voiceChannelId: session.voiceChannelId,
      });
      await categoryDoc.save();

      // Atualiza stats
      const allParticipants = [...new Set([...session.players, mestreId])];
      await User.updateMany(
        { userID: { $in: allParticipants }, guildID: categoryDoc.guildID },
        { $inc: { sessoesJogadas: 1 } }
      );
      await User.updateOne({ userID: mestreId, guildID: categoryDoc.guildID }, { $inc: { sessoesMestradas: 1 } });
    } catch (err) {
      console.error("[VOICESTATE] Erro ao salvar sessão:", err);
      activeSessions.delete(mestreId);
      return;
    }

    // Remove da memória
    activeSessions.delete(mestreId);

    // Envia embed no canal geral da mesa
    const generalChannelId = categoryDoc.campaignData.generalChannelID;
    if (generalChannelId) {
      const generalChannel =
        (guild.channels.cache.get(generalChannelId) as TextChannel) ||
        (await guild.channels.fetch(generalChannelId).catch(() => null));
      if (generalChannel && generalChannel.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle("🎲 Sessão Encerrada")
          .setColor("#ff6868")
          .setDescription(
            `Todos saíram do canal de voz, incluindo o mestre.\n` +
              `Assumo que a sessão foi finalizada e acabo de registrar-la no banco de dados!\n` +
              `Duração: ${durationMinutes} minutos`
          )
          .setTimestamp();
        await generalChannel.send({ embeds: [embed] }).catch(console.error);
      }
    }
  },
};
