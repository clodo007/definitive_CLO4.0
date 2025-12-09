import {
  Client,
  GuildMember,
  EmbedBuilder,
  TextChannel,
  Events
} from "discord.js";

export default {
  name: Events.GuildMemberRemove,
  once: false,

  async execute(member: GuildMember, client: Client) {
    try {
      const canalSaidaID = "1440432117439008858";

      const guild = member.guild;
      const user = member.user;

      const dataEntrada = member.joinedTimestamp
        ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`
        : "Não foi possível determinar";

            let duracaoEstadia = "Não foi possível determinar";

      if (member.joinedTimestamp) {
        const agora = Date.now();
        const diferencaMs = agora - member.joinedTimestamp; 

        const dias = Math.floor(diferencaMs / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencaMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencaMs % (1000 * 60 * 60)) / (1000 * 60));

        duracaoEstadia = `${dias}d, ${horas}h, ${minutos}m`;
      }

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .setTitle("<a:ppl:1448063525338484766> Um Hóspede fez check-out do Hotel!")
        .setDescription(`O usuário **${user.username}**\n com ID: **${user.id}**\n\n saiu pela porta principal e deixou o servidor\n`)
        .addFields(
          {
            name: "<a:bash:1448053726295363605> Membro que saiu:",
            value: `> ${member}`,
            inline: true
          },
          {
            name: "<a:nbd:1448041868960075786> Entrou em:",
            value: dataEntrada,
            inline: true
          },
           {
            name: "<a:bll:1448056354458570872> Duraçao da Estadia:",
            value: duracaoEstadia,
            inline: false
          }
        )
        .setFooter({
          text: `Sistema de Saidas do CLO`
        })
        .setTimestamp();

      const canal = guild.channels.cache.get(canalSaidaID);

      if (canal && canal.isTextBased()) {
        await (canal as TextChannel).send({ embeds: [embed] });
      }
    } catch (err) {
      console.error("Erro no evento de saída:", err);
    }
  }
};
