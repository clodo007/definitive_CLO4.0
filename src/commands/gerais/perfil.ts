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
    .setDescription(`<a:mod:1448033874453069825> **Hierarquia no Hotel:** <@&${cargoHierarquiaId}>`)
    .addFields(
      {
        name: "PROGRESSO",
        value: `<a:bvsh:1448053693613084867> **Rank**: ' x '\n<a:str:1448033916635320381> **Nível**: ${jogador.nivel}\n<a:sst:1448034501690265691> **Mesas Jogadas**: ${jogador.mesasJogadas}\n<a:yst:1448034379535356075> **Mesas Mestradas**: —`,
        inline: true,
      },
      {
        name: "REGISTROS",
        value:
          `<a:larm:1448056161164202035> **Horas em Call**: —\n` +
          `<a:gst:1448034346337304791> **Sessões Jogadas**: —\n` +
          `<a:ost:1448034538545741935> **Sessões Narradas**: —\n` +
          `<a:typ:1448034311642026046> **Mensagens Totais**: —\n` +
          `<a:dic:1448034244512452669> **Dados Rolados**: —`,
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
          `<a:nbd:1448041868960075786> **Conta criada em:** ${dataCriacaoConta}\n` +
          `<a:prt:1448033983383212223> **Check-in no Hotel:** ${dataEntradaServidor}`,
        inline: false,
      }
    )
    .setFooter({ text: "Hotel dos Parças • Sistema de Perfis" });

  await interaction.reply({ embeds: [embed] });
}
