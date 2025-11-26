import { Channel, GuildBasedChannel } from "discord.js";
import { Category } from "../../schemas/categorySchema";

module.exports = {
  name: "channelUpdate",
  async execute(oldChannel: Channel, newChannel: Channel) {
    // Garantir que ambos são canais de servidor
    if (!oldChannel || !newChannel) return;
    if (!("guild" in newChannel)) return; // só guild channels

    const guildChannel = newChannel as GuildBasedChannel;

    // Só queremos trabalhar se o nome foi alterado
    if ("name" in oldChannel && "name" in newChannel) {
      if (oldChannel.name === newChannel.name) return;
    } else {
      // Se algum não tem name, não é canal renomeável (DM, etc.)
      return;
    }

    // Buscar categoria no banco que contém esse canal
    const categoryDoc = await Category.findOne({
      guildID: newChannel.guild.id,
      "channels.channelID": newChannel.id,
    });

    if (!categoryDoc) return;

    // Atualizar somente o nome
    const channelRef = categoryDoc.channels.find((c: any) => c.channelID === newChannel.id);

    if (!channelRef) return;

    channelRef.name = newChannel.name;

    await categoryDoc.save().catch((err) => console.error("Erro ao salvar:", err));

    console.log(`Canal atualizado no banco: ${newChannel.name}`);
  },
};
