import { Client, Events, GuildChannel } from "discord.js";
import { Category } from "../../schemas/categorySchema";

export default {
  name: Events.ChannelCreate,
  once: false,

  async execute(channel: GuildChannel, client: Client) {
    try {
      // Só continuar se for dentro de uma guild
      if (!channel.guild) return;

      // Verifica se o canal tem uma categoria
      if (!channel.parentId) return;

      // Busca a categoria no banco de dados
      const categoryDoc = await Category.findOne({ categoryID: channel.parentId });
      if (!categoryDoc) return;

      // Adiciona o canal recém-criado no array de channels do schema
      categoryDoc.channels.push({
        channelID: channel.id,
        name: channel.name,
        type: channel.isTextBased() ? "text" : channel.isVoiceBased() ? "voice" : "other",
        createdAt: new Date(),
      });

      await categoryDoc.save();

      console.log(`[CHANNEL CREATE] Canal ${channel.name} registrado na categoria ${categoryDoc.name}`);
    } catch (err) {
      console.error("[CHANNEL CREATE] Erro ao registrar canal:", err);
    }
  },
};
