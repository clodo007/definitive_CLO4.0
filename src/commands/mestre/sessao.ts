import { ChatInputCommandInteraction, Client, SlashCommandBuilder, TextChannel, VoiceState } from "discord.js";
import { Category } from "../../schemas/categorySchema";
import { User } from "../../schemas/userSchema";

interface ActiveSession {
  startedAt: number;
  players: string[];
  categoryId: string;
}

export const activeSessions: Map<string, ActiveSession> = new Map();

function formatDuration(ms: number) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

export function startSession(userId: string, categoryId: string, players: string[]) {
  activeSessions.set(userId, {
    startedAt: Date.now(),
    players,
    categoryId,
  });
}

export const data = new SlashCommandBuilder()
  .setName("sessao")
  .setDescription("Inicia uma sessao de jogo para sua mesa");

export async function execute(
  interaction: ChatInputCommandInteraction,
  oldState: VoiceState,
  newState: VoiceState,
  client: Client
) {
  if (oldState.channelId && oldState.channelId !== newState.channelId) {
    const channel = oldState.channel;
    if (!channel) return;

    const humanMembers = channel.members.filter((m) => !m.user.bot);
    if (humanMembers.size > 0) return;

    const sessionEntry = Array.from(activeSessions.entries()).find(([, v]) => v.categoryId === channel.parentId);
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
    await (logChannel as TextChannel).send(
      `Sessão do mestre: <@${mestreId}> concluída na data: ${endTime.toLocaleString()}\n` +
        `Jogadores que participaram: ${playerMentions}`
    );
  }
}
