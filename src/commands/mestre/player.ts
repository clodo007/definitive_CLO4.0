import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, Role, SlashCommandBuilder } from "discord.js";
import { Category } from "../../schemas/categorySchema";
import { Role as RoleDB } from "../../schemas/rolesSchema";
import { User } from "../../schemas/userSchema";

export const data = new SlashCommandBuilder()
  .setName("player")
  .setDescription("Gerencia os Comandos usados pelos Mestres")
  .addSubcommand((sub) =>
    sub
      .setName("adicionar")
      .setDescription("Adiciona a Tag de sua Mesa a um Player")
      .addRoleOption((option) =>
        option.setName("tag-de-sua-mesa").setDescription("Tag da mesa a ser atribuída").setRequired(true)
      )
      .addUserOption((option) =>
        option.setName("jogador").setDescription("Jogador que receberá a tag").setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("remover")
      .setDescription("Remove o cargo da sua mesa de um jogador")
      .addRoleOption((option) =>
        option.setName("tag-de-sua-mesa").setDescription("Tag da mesa a ser removida").setRequired(true)
      )
      .addUserOption((option) =>
        option.setName("jogador").setDescription("Jogador que perderá a tag").setRequired(true)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild!;
  const mestre = interaction.member as GuildMember;
  const jogador = interaction.options.getMember("jogador") as GuildMember;
  const cargoMesa = interaction.options.getRole("tag-de-sua-mesa") as Role;
  const sub = interaction.options.getSubcommand();

  const mestreDB = await User.findOne({ guildID: guild.id, userID: mestre.id });
  if (!mestreDB) return interaction.reply({ content: "⚠️ Seus dados não foram encontrados.", ephemeral: true });

  const categoria = await Category.findOne({
    guildID: guild.id,
    "campaignData.masterID": mestre.id,
    "campaignData.newRoleID": cargoMesa.id,
  });

  if (!categoria || !categoria.isCampaign)
    return interaction.reply({
      content: "🚫 Essa tag não pertence à sua mesa.",
      ephemeral: true,
    });

  if (sub === "adicionar") {
    await jogador.roles.add(cargoMesa);
    await User.findOneAndUpdate(
      { guildID: guild.id, userID: jogador.id },
      { $addToSet: { roles: cargoMesa.id } },
      { upsert: true }
    );
    await RoleDB.findOneAndUpdate(
      { guildID: guild.id, roleID: cargoMesa.id },
      { $addToSet: { membersWhoHasTheRole: jogador.id } },
      { upsert: true }
    );
    await Category.updateOne({ _id: categoria._id }, { $addToSet: { "campaignData.players": jogador.id } });

    const canalGeral = guild.channels.cache.get(categoria.campaignData.generalChannelID);
    if (canalGeral?.isTextBased()) {
      const embed = new EmbedBuilder()
        .setColor(cargoMesa.color || 0x00ff00)
        .setTitle("🎲 Novo jogador na mesa!")
        .setDescription(
          `> <@${jogador.id}> acabou de se juntar à mesa **${categoria.name.replace(/^🟡/, "")}**!\n\n` +
            `Bem-vindo(a), aventureiro!!`
        )
        .setFooter({ text: `Mestre: ${mestre.displayName}` })
        .setTimestamp();
      await canalGeral.send({ embeds: [embed] });
    }

    // Envia DM para o jogador
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("✅ Você foi adicionado a uma mesa!")
        .setDescription(
          `O mestre <@${mestre.id}> adicionou você como jogador na mesa **${categoria.name.replace(/^🟡/, "")}**.\n\n` +
            `Desejamos uma excelente aventura!\n` +
            `De um oi no Chat Geral da mesa: <#${canalGeral?.id}>`
        )
        .setFooter({ text: `Sistema de Notificaçoes do CLO` })

        .setTimestamp();
      await jogador.send({ embeds: [dmEmbed] });
    } catch {}

    return interaction.reply(
      `✅ ${jogador.user} recebeu a tag [<@&${cargoMesa.id}>] da mesa do mestre <@${mestre.id}>`
    );
  }

  if (sub === "remover") {
    await jogador.roles.remove(cargoMesa);
    await User.findOneAndUpdate({ guildID: guild.id, userID: jogador.id }, { $pull: { roles: cargoMesa.id } });
    await RoleDB.findOneAndUpdate(
      { guildID: guild.id, roleID: cargoMesa.id },
      { $pull: { membersWhoHasTheRole: jogador.id } }
    );
    await Category.updateOne({ _id: categoria._id }, { $pull: { "campaignData.players": jogador.id } });
    const canalGeral = guild.channels.cache.get(categoria.campaignData.generalChannelID);
    if (canalGeral?.isTextBased()) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("👋 Infelizmente, isso é um Adeus")
        .setDescription(
          `> <@${jogador.id}> foi removido da mesa **${categoria.name.replace(/^🟡/, "")}**.\n\n` +
            `Boa sorte em suas próximas aventuras! `
        )
        .setFooter({ text: `Sistema de Notificaçoes do CLO` })
        .setTimestamp();
      await canalGeral.send({ embeds: [embed] });
    }
    // Envia DM para o jogador
    try {
      const dmEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("❌ Ops, parece que você foi removido de uma Mesa!")
        .setDescription(
          `O mestre <@${mestre.id}> removeu você da mesa **${categoria.name.replace(/^🟡/, "")}**.\n\n` +
            `Isso foi um engano? Comunique-se com a **Gerencia do Hotel** para mais informações.`
        )
        .setFooter({ text: `Sistema de Notificaçoes do CLO` })

        .setTimestamp();
      await jogador.send({ embeds: [dmEmbed] });
    } catch {}

    return interaction.reply(`❌ ${jogador.user} perdeu a tag [<@&${cargoMesa.id}>] da mesa do mestre <@${mestre.id}>`);
  }
}
