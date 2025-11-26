import { Client, Events, GuildChannel } from "discord.js";
import { Category } from "../../schemas/categorySchema";

export default {
  name: Events.ChannelDelete,
  once: false,

  async execute(channel: GuildChannel, client: Client) {
    try {
      // Só continuar se for dentro de uma guild
      if (!channel.guild) return;

      // Verifica se o canal tinha uma categoria
      if (!channel.parentId) return;

      // Busca a categoria no banco de dados
      const categoryDoc = await Category.findOne({ categoryID: channel.parentId });
      if (!categoryDoc) return;

      // Remove o canal do array de channels
      const index = categoryDoc.channels.findIndex((c) => c.channelID === channel.id);
      if (index !== -1) {
        categoryDoc.channels.splice(index, 1);
      }

      await categoryDoc.save();

      console.log(`[CHANNEL DELETE] Canal ${channel.name} removido da categoria ${categoryDoc.name}`);
    } catch (err) {
      console.error("[CHANNEL DELETE] Erro ao remover canal:", err);
    }
  },
};
