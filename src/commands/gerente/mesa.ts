import {
  CategoryChannel,
  ChannelType,
  ChatInputCommandInteraction,
  ColorResolvable,
  EmbedBuilder,
  GuildMember,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { Category } from "../../schemas/categorySchema";
import { Role } from "../../schemas/rolesSchema";
import { User } from "../../schemas/userSchema";

const channelIDWhoWillRecieveTheLog = "1441743718406295643";

export const data = new SlashCommandBuilder()
  .setName("mesa")
  .setDescription("Gerencia a Criação e Deleção de Mesas pela Staff")
  .addSubcommand((sub) =>
    sub
      .setName("criar")
      .setDescription("Cria uma nova mesa pronta para jogar")
      .addStringOption((option) =>
        option.setName("emoji-da-mesa").setDescription("Emoji da mesa (unicode)").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("nome-da-mesa").setDescription("Nome completo da mesa").setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("tag-de-mesa").setDescription("Nome da Tag da mesa").setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("cor-da-tag")
          .setDescription("Cor do cargo")
          .setRequired(true)
          .addChoices(
            { name: "🔴 Vermelho", value: "#FF0000" },
            { name: "🟠 Laranja", value: "#FFA500" },
            { name: "🟡 Amarelo", value: "#FFFF00" },
            { name: "🟢 Verde", value: "#008000" },
            { name: "🔵 Azul", value: "#0000FF" },
            { name: "🟣 Roxo", value: "#800080" },
            { name: "🟤 Marrom", value: "#A52A2A" },
            { name: "⚫ Preto", value: "#080707" },
            { name: "⚪ Branco", value: "#FFFFFF" },
            { name: "💖 Rosa", value: "#FF69B4" },
            { name: "🧡 Pêssego", value: "#FFDAB9" },
            { name: "💛 Amarelo Claro", value: "#FFFFE0" },
            { name: "💚 Verde Menta", value: "#98FF98" },
            { name: "💙 Azul Claro", value: "#ADD8E6" },
            { name: "💜 Lilás", value: "#C8A2C8" },
            { name: "🤎 Bege", value: "#F5F5DC" },
            { name: "🖤 Cinza Escuro", value: "#2F4F4F" },
            { name: "⚪ Prata", value: "#C0C0C0" },
            { name: "🌈 Arco-Íris", value: "#FF4500" },
            { name: "🔥 Fogo", value: "#FF6347" },
            { name: "💧 Água", value: "#1E90FF" },
            { name: "🍃 Folha", value: "#228B22" },
            { name: "☁️ Nuvem", value: "#F0F8FF" },
            { name: "🌙 Noite", value: "#191970" },
            { name: "☀️ Sol", value: "#FFD700" }
          )
      )
      .addUserOption((option) =>
        option.setName("mestre-da-mesa").setDescription("Usuário mestre da mesa").setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("deletar")
      .setDescription("Deleta uma mesa e seu cargo permanentemente")
      .addStringOption((option) =>
        option.setName("id-da-categoria").setDescription("ID da categoria da mesa").setRequired(true)
      )
      .addRoleOption((option) => option.setName("cargo-da-mesa").setDescription("Cargo da mesa a ser deletado"))
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "criar") {
    await criarMesa(interaction);
  }

  if (subcommand === "deletar") {
    await deletarMesa(interaction, channelIDWhoWillRecieveTheLog);
  }
}

async function criarMesa(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ flags: 64 });

  const guild = interaction.guild!;
  const emoji = interaction.options.getString("emoji-da-mesa", true);
  const nome = interaction.options.getString("nome-da-mesa", true);
  const tag = interaction.options.getString("tag-de-mesa", true);
  const cor = interaction.options.getString("cor-da-tag", true) as ColorResolvable;
  const mestre = interaction.options.getMember("mestre-da-mesa") as GuildMember;

  const roleCreated = await guild.roles.create({
    name: `${emoji} ${tag}`,
    mentionable: true,
    color: cor,
  });

  const startRole = guild.roles.cache.get("1171534726276853882");
  const endRole = guild.roles.cache.get("1171533586994843699");

  if (startRole && endRole) {
    const pos = Math.min(startRole.position, endRole.position) + 1;
    await roleCreated.setPosition(pos).catch(() => {});
  }

  const categorias = guild.channels.cache.filter((c): c is CategoryChannel => c.type === ChannelType.GuildCategory);

  const ultimaNova = categorias
    .filter((c) => c.name.startsWith("🟡"))
    .sort((a, b) => a.position - b.position)
    .at(-1);

  const categoryOptions: any = {
    name: `🟡${emoji} ${nome}`,
    type: ChannelType.GuildCategory,
  };

  if (ultimaNova) categoryOptions.position = ultimaNova.position;

  const categoryCreated = await guild.channels.create(categoryOptions);

  const generalChannel = await guild.channels.create({
    name: `geral-${nome}`,
    type: ChannelType.GuildText,
    parent: categoryCreated.id,
  });

  const materialChannel = await guild.channels.create({
    name: "material",
    type: ChannelType.GuildText,
    parent: categoryCreated.id,
  });

  const fichasChannel = await guild.channels.create({
    name: "fichas",
    type: ChannelType.GuildForum,
    parent: categoryCreated.id,
  });

  const dadosChannel = await guild.channels.create({
    name: "dados",
    type: ChannelType.GuildText,
    parent: categoryCreated.id,
  });

  const sessaoChannel = await guild.channels.create({
    name: `sessao ${nome}`,
    type: ChannelType.GuildVoice,
    parent: categoryCreated.id,
  });

  const canais = [generalChannel, materialChannel, fichasChannel, dadosChannel, sessaoChannel];

  const everyone = guild.roles.everyone;
  const gerente = guild.roles.cache.find((r) => r.name.toLowerCase().includes("gerente"));

  await categoryCreated.permissionOverwrites.create(everyone, { ViewChannel: false });
  await categoryCreated.permissionOverwrites.create(roleCreated, { ViewChannel: true });

  if (gerente) await categoryCreated.permissionOverwrites.create(gerente, { ViewChannel: true });

  await categoryCreated.permissionOverwrites.create(mestre, {
    ViewChannel: true,
    ManageChannels: true,
    ManageRoles: true,
    ManageMessages: true,
    ManageWebhooks: true,
    Connect: true,
    Speak: true,
    Stream: true,
    SendMessages: true,
    MentionEveryone: true,
    AttachFiles: true,
    EmbedLinks: true,
  });

  function channelTypeToString(t: ChannelType) {
    if (t === ChannelType.GuildText || t === ChannelType.GuildAnnouncement) return "text";
    if (t === ChannelType.GuildVoice) return "voice";
    if (t === ChannelType.GuildForum) return "forum";
    if (t === ChannelType.PublicThread || t === ChannelType.PrivateThread || t === ChannelType.AnnouncementThread)
      return "thread";
    return "text";
  }

  await Role.updateOne(
    {
      guildID: guild.id,
      roleID: roleCreated.id,
    },
    {
      $set: {
        name: roleCreated.name,
        color: roleCreated.hexColor,
        isCampaignRole: true,
      },
    },
    { upsert: true }
  );

  const newCategory = await Category.create({
    guildID: guild.id,
    categoryID: categoryCreated.id,
    name: categoryCreated.name,
    isCampaign: true,
    channels: canais.map((ch) => ({
      channelID: ch.id,
      name: ch.name,
      type: channelTypeToString(ch.type as ChannelType),
    })),
    campaignData: {
      newRoleID: roleCreated.id,
      masterID: mestre.id,
      generalChannelID: generalChannel.id,
      isActive: true,
    },
  });

  await User.updateOne(
    { guildID: guild.id, userID: mestre.id },
    { $addToSet: { campaignIDs: newCategory._id } },
    { upsert: true }
  );

  const welcomeEmbed = new EmbedBuilder()
    .setColor(cor)
    .setTitle(`🎲 Chega mais um andar ao Hotel, ${mestre.displayName}!`)
    .setDescription(
      `> Bem-vindo à sua mesa, mestre <@${mestre.id}>!\n\n` +
        `Esta mesa possui a tag <@&${roleCreated.id}>.\n\n` +
        `Você pode modificar todos os canais desta categoria e até mesmo mudar o **nome** dela.\n\n` +
        `⚠️ **Mas há duas coisas que você não pode fazer:**\n` +
        `- 1️⃣ Mudar o **ícone da mesa** (a bolinha amarela).\n` +
        `- 2️⃣ Excluir o canal **#${generalChannel.name}** (<#${generalChannel.id}>) voce entretanto pode renomear-lo como quiser.\n\n` +
        `Para adicionar um jogador a sua mesa basta utilizar o comando **/player adicionar** se precisar de mais informações, digite **/ajuda** ou chame algum **@gerente** disponível.`
    )
    .setFooter({ text: "Divirta-se e boas rolagens de dados!" })
    .setTimestamp();

  await generalChannel.send({ embeds: [welcomeEmbed] });

  await interaction.editReply({
    content: `✅ Mesa **${nome}** criada com sucesso!`,
  });
}

async function deletarMesa(interaction: ChatInputCommandInteraction, logID: string) {
  await interaction.deferReply({ flags: 64 });

  const guild = interaction.guild!;
  const member = interaction.member as GuildMember;
  const idCategoria = interaction.options.getString("id-da-categoria", true);

  const log = guild.channels.cache.get(logID) as TextChannel;

  try {
    const categoria = (await guild.channels.fetch(idCategoria)) as CategoryChannel;

    if (!categoria) return interaction.editReply({ content: "❌ Categoria não encontrada." });

    const categoryDoc = await Category.findOne({
      categoryID: idCategoria,
      guildID: guild.id,
    });

    if (!categoryDoc || !categoryDoc.isCampaign)
      return interaction.editReply({
        content: "❌ Essa categoria não é uma mesa registrada no Banco de Dados.",
      });

    const canais = guild.channels.cache.filter((c) => c.parentId === idCategoria);

    for (const canal of canais.values()) {
      await canal.delete().catch(() => {});
    }

    const roleID = categoryDoc.campaignData?.newRoleID;

    if (roleID) {
      const role = guild.roles.cache.get(roleID);
      if (role) await role.delete().catch(() => {});
      await Role.deleteOne({ guildID: guild.id, roleID }).catch(() => {});
    }

    await categoria.delete().catch(() => {});

    await Category.deleteOne({ categoryID: idCategoria });

    await User.updateOne(
      {
        guildID: guild.id,
        userID: categoryDoc.campaignData.masterID,
      },
      {
        $pull: { campaignIDs: categoryDoc._id },
      }
    );

    await interaction.editReply({
      content: `✅ Mesa **${categoria.name}** e Cargo deletada com sucesso.`,
    });

    if (log) await log.send(`🗑️ ${member} deletou a mesa **${categoria.name}**.`);
  } catch (err) {
    console.error("Erro ao deletar mesa:", err);
    await interaction.editReply({
      content: "❌ Ocorreu um erro ao deletar a mesa.",
    });
  }
}
