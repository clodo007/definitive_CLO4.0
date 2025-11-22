import { ChatInputCommandInteraction, EmbedBuilder, GuildMember, SlashCommandBuilder } from "discord.js";

const jogadores = new Map<string, { nivel: number; mesasJogadas: number }>();

export const data = new SlashCommandBuilder()
  .setName("perfil")
  .setDescription("Mostra informações do seu perfil no servidor.")
  .addUserOption((option) =>
    option.setName("usuário").setDescription("Veja o perfil de outro jogador (opcional).").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser("usuário") || interaction.user;

  if (targetUser.bot) {
    return interaction.reply({
      content: "🚫 Este comando não pode ser usado com bots.",
      ephemeral: true,
    });
  }

  const guild = interaction.guild!;
  const member = (await guild.members.fetch(targetUser.id)) as GuildMember;

  let jogador = jogadores.get(targetUser.id);
  if (!jogador) {
    jogador = { nivel: 1, mesasJogadas: 0 };
    jogadores.set(targetUser.id, jogador);
  }

  const cargoHierarquiaId = "1429071033285218324";
  const cargosMesa = member.roles.cache.filter((r) => r.name.includes("Mesa"));
  const cargosNotificacao = member.roles.cache.filter((r) => r.name.toLowerCase().includes("notificação"));

  function formatarData(date: Date) {
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  }

  const dataCriacaoConta = formatarData(targetUser.createdAt);
  const dataEntradaServidor = formatarData(member.joinedAt!);

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `${targetUser.username} — Perfil`,
      iconURL: targetUser.displayAvatarURL({ extension: "png", size: 1024 }),
    })
    .setColor(0x00aeff)
    .setThumbnail(targetUser.displayAvatarURL({ extension: "png", size: 1024 }))
    .setDescription(`<a:hnh:1436138028358832281> **Hierarquia no Hotel:** <@&${cargoHierarquiaId}>`)
    .addFields(
      {
        name: "PROGRESSO",
        value: `<a:sr:1436145341534830644> **Rank**: ' x '\n<a:xps:1436145273125474484> **Nível**: ${jogador.nivel}\n<a:ws:1436144759151263744> **Mesas Jogadas**: ${jogador.mesasJogadas}\n<a:st:1436143787847188580> **Mesas Mestradas**: —`,
        inline: true,
      },
      {
        name: "REGISTROS",
        value:
          `<a:clock:1436093347621245111> **Horas em Call**: —\n` +
          `<a:gs:1436144693074460682> **Sessões Jogadas**: —\n` +
          `<a:os:1436146781179351122> **Sessões Narradas**: —\n` +
          `<a:ty:1436149200340385792> **Mensagens Totais**: —\n` +
          `<a:dr:1436090570614509628> **Dados Rolados**: —`,
        inline: true,
      },
      {
        name: "ANDARES",
        value:
          cargosMesa.size > 0 ? cargosMesa.map((r) => `<@&${r.id}>`).join(", ") : "Nenhum cargo de mesa encontrado",
        inline: false,
      },
      {
        name: "PREFERÊNCIAS",
        value:
          cargosNotificacao.size > 0
            ? cargosNotificacao.map((r) => `<@&${r.id}>`).join(", ")
            : "Nenhum cargo de notificação configurado",
        inline: false,
      },
      {
        name: "PASSAPORTE",
        value:
          `<a:bb:1436136799591334049> **Conta criada em:** ${dataCriacaoConta}\n` +
          `<a:hbj:1436136853265977437> **Check-in no Hotel:** ${dataEntradaServidor}`,
        inline: false,
      }
    )
    .setFooter({ text: "Hotel dos Parças • Sistema de Perfis" });

  await interaction.reply({ embeds: [embed] });
}
