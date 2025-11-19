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

const channelIDWhoWillRecieveTheLog = "1436402561463881952";

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
      .addStringOption((option) => option.setName("tag-de-mesa").setDescription("Tag da mesa").setRequired(true))
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
            { name: "⚫ Preto", value: "#000000" },
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
      .addRoleOption((option) =>
        option.setName("cargo-da-mesa").setDescription("Cargo da mesa que será deletado").setRequired(true)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();

  if (sub === "criar") return criarMesa(interaction);
  if (sub === "deletar") return deletarMesa(interaction, channelIDWhoWillRecieveTheLog);
}

async function criarMesa(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild!;
  const emoji = interaction.options.getString("emoji-da-mesa", true);
  const nome = interaction.options.getString("nome-da-mesa", true);
  const tag = interaction.options.getString("tag-de-mesa", true);
  const cor = interaction.options.getString("cor-da-tag", true) as ColorResolvable;
  const mestre = interaction.options.getMember("mestre-da-mesa") as GuildMember;

  // Criar cargo
  const roleCreated = await guild.roles.create({
    name: `${emoji} ${tag}`,
    color: cor,
    mentionable: true,
  });

  // Criar categoria
  const categoryCreated = await guild.channels.create({
    name: `🟡${emoji} ${nome}`,
    type: ChannelType.GuildCategory,
  });

  // Criar canais
  const general = await guild.channels.create({
    name: `geral-${nome}`,
    type: ChannelType.GuildText,
    parent: categoryCreated.id,
  });

  const material = await guild.channels.create({
    name: "material",
    type: ChannelType.GuildText,
    parent: categoryCreated.id,
  });

  const fichas = await guild.channels.create({
    name: "fichas",
    type: ChannelType.GuildForum,
    parent: categoryCreated.id,
  });

  const dados = await guild.channels.create({
    name: "dados",
    type: ChannelType.GuildText,
    parent: categoryCreated.id,
  });

  const sessao = await guild.channels.create({
    name: `sessao-${nome}`,
    type: ChannelType.GuildVoice,
    parent: categoryCreated.id,
  });

  // Permissões
  await categoryCreated.permissionOverwrites.create(guild.roles.everyone, { ViewChannel: false });
  await categoryCreated.permissionOverwrites.create(roleCreated, { ViewChannel: true });
  await categoryCreated.permissionOverwrites.create(mestre, {
    ViewChannel: true,
    ManageChannels: true,
    Connect: true,
    Speak: true,
    SendMessages: true,
  });

  // Embed de boas vindas
  const welcome = new EmbedBuilder()
    .setColor(cor)
    .setTitle(`🎲 Seja bem-vindo, ${mestre.displayName}!`)
    .setDescription(
      `> A mesa foi criada com sucesso!\n\n` +
        `Tag da mesa: <@&${roleCreated.id}>\n\n` +
        `Lembre-se:\n` +
        `1️⃣ Você não pode alterar o ícone da categoria.\n` +
        `2️⃣ Não delete o canal **#${general.name}**.\n\n`
    );

  await general.send({ embeds: [welcome] });

  await interaction.editReply(`✅ Mesa **${nome}** criada com sucesso!`);
}

async function deletarMesa(interaction: ChatInputCommandInteraction, logID: string) {
  await interaction.deferReply({ ephemeral: true });

  const guild = interaction.guild!;
  const categoriaID = interaction.options.getString("id-da-categoria", true);
  const cargo = guild.roles.cache.get(interaction.options.getRole("cargo-da-mesa", true).id)!;
  const logger = guild.channels.cache.get(logID) as TextChannel;

  // Pegar categoria
  const categoria = guild.channels.cache.get(categoriaID) as CategoryChannel;
  if (!categoria) return interaction.editReply("❌ Categoria não encontrada.");

  // Deletar canais dentro da categoria
  const channels = guild.channels.cache.filter((c) => c.parentId === categoria.id);
  for (const c of channels.values()) {
    await c.delete().catch(() => {});
  }

  // Deletar categoria
  await categoria.delete().catch(() => {});

  // Deletar cargo
  await cargo.delete().catch(() => {});

  // Log
  if (logger) {
    logger.send(`🗑️ ${interaction.user} deletou a mesa **${categoria.name}**.`);
  }

  await interaction.editReply("✅ Mesa deletada com sucesso!");
}
