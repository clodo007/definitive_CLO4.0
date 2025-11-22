import { Client, Events, TextChannel, VoiceState } from "discord.js";
import { activeSessions } from "../../commands/mestre/sessao"; // importa seu Map
import { Category } from "../../schemas/categorySchema";
import { User } from "../../schemas/userSchema";

export default {
  name: Events.VoiceStateUpdate,
  once: false,
  async execute(oldState: VoiceState, newState: VoiceState, client: Client) {
    const oldChannel = oldState.channel;
    if (!oldChannel) return;

    const humanMembers = oldChannel.members.filter((m) => !m.user.bot);
    if (humanMembers.size > 0) return;

    const sessionEntry = Array.from(activeSessions.entries()).find(([, v]) => v.categoryId === oldChannel.parentId);
    if (!sessionEntry) return;

    const [mestreId, session] = sessionEntry;

    const endTime = new Date();
    const durationMs = endTime.getTime() - session.startedAt;

    const categoryDoc = await Category.findOne({ categoryID: session.categoryId });
    if (!categoryDoc || !categoryDoc.campaignData) return;

    categoryDoc.campaignData.sessions.push({
      date: session.startedAt,
      duration: durationMs / 1000 / 60 / 60,
      players: session.players,
      dadosRolados: 0,
      notes: "",
    });
    await categoryDoc.save();

    await User.updateMany(
      { userID: { $in: session.players }, guildID: categoryDoc.guildID },
      { $inc: { sessoesJogadas: 1 } }
    );

    await User.updateOne({ userID: mestreId, guildID: categoryDoc.guildID }, { $inc: { sessoesMestradas: 1 } });

    activeSessions.delete(mestreId);

    const logChannelId = "1385742418812342302";
    const logChannel = client.channels.cache.get(logChannelId);
    const playerMentions = session.players.map((id) => `<@${id}>`).join(", ") || "Ninguém";

    if (logChannel?.isTextBased()) {
      await (logChannel as TextChannel).send(
        `Sessão do mestre: <@${mestreId}> concluída na data: ${endTime.toLocaleString()}\n` +
          `Jogadores que participaram: ${playerMentions}`
      );
    }
  },
};
