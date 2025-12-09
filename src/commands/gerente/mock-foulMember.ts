import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("mock-foulmemberban")
    .setDescription("Mostra os embeds do evento de saída de jogador"),

  async execute(interaction: ChatInputCommandInteraction) {
    const member = interaction.member; // seu próprio usuário
    const masterID = interaction.user.id; // só para mock
    const generalChannelID = interaction.channelId;

    const userEmbed = new EmbedBuilder()
      .setTitle("Banimento Permanente")
      .setDescription(
        "Você saiu do servidor enquanto participava de uma mesa, o que viola nossas regras internas.\n\n" +
        "Portanto, você foi **Banido Permanentemente** sem possibilidade de retorno.\n\n" +
        "Acredita que houve um engano?\n" +
        "Entre em contato com qualquer membro da gerência."
      )
      .setColor("DarkRed");

    const masterEmbed = new EmbedBuilder()
      .setTitle("Jogador Removido da Mesa")
      .setDescription(
        `O jogador **${interaction.user.tag}** saiu do servidor enquanto possuía uma tag de mesa ou campanha.\n\n` +
        "O usuário seria **banido automaticamente** (mock)."
      )
      .setColor("Orange");

    const notifyEmbed = new EmbedBuilder()
      .setTitle("Jogador Saiu do Servidor")
      .setDescription(
        `O jogador **${interaction.user.tag}** deixou o servidor durante a campanha.\n` +
        "Como previsto nas regras, ele seria **banido automaticamente** (mock)."
      )
      .setColor("Orange");

    await interaction.reply({ content: "📌 **Embed do jogador:**", embeds: [userEmbed] });
    await interaction.followUp({ content: "📌 **Embed do mestre:**", embeds: [masterEmbed] });
    await interaction.followUp({ content: "📌 **Embed do canal geral da mesa:**", embeds: [notifyEmbed] });
  }
};
