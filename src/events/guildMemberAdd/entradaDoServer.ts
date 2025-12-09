import {
  Client,
  GuildMember,
  EmbedBuilder,
  TextChannel,
  Events
} from "discord.js";
import { Role } from "../../schemas/rolesSchema";

export default {
  name: Events.GuildMemberAdd,
  once: false,

  async execute(member: GuildMember, client: Client) {
    try {
      const canalBoasVindasID = "1440432117439008858";
      const canalRegrasID = "1426518795383603200";
      const canalOnboardingID = "1429783029198491721";

      const guild = member.guild;

    
      const notificationRoles = await Role.find({
        guildID: guild.id,
        isNotificationRole: true
      });

      const notificationRoleIds = notificationRoles.map((r) => r.roleID);

      const cargosIniciais = member.roles.cache
        .filter(
          (r) =>
            r.id !== guild.id &&
            notificationRoleIds.includes(r.id) 
        )
        .map((r) => `<@&${r.id}>`);

      const cargosTexto =
        cargosIniciais.length > 0
          ? cargosIniciais.join(", ")
          : "Nenhum cargo de notificação selecionado.";

   

      const dataCriacao = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:d>`;
      const dataEntrada = `<t:${Math.floor(member.joinedTimestamp! / 1000)}:d>`;
      const horaCriacao = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:t>`;
      const horaEntrada = `<t:${Math.floor(member.joinedTimestamp! / 1000)}:t>`;


      const embed = new EmbedBuilder()
        .setColor(0x00aaff)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setTitle("<a:vr:1448033834846261248> Chega um Novo hóspede ao Hotel!")
        .setDescription(
          `Seja muito bem-vindo, ${member}! ` +
            `Abaixo estão algumas informações importantes para sua estadia no servidor.\n\n` +
            `- 📜 Leia as regras: <#${canalRegrasID}>\n` +
            `- 💬 Fale algo no canal Geral: <#${canalOnboardingID}>\n`+
            `- 🐉 Veja as Mesas da Casa: <#${canalRegrasID}>\n` +
            `- 🎨 Acesse a workshop: <#${canalOnboardingID}>\n`+
            `- 👾 Va ao fliperama: <#${canalOnboardingID}>`
        )
        .addFields(
          {
            name: `<a:nbd:1448041868960075786> Conta criada: ${dataCriacao} as ${horaCriacao}`,
            value: "",
            inline: true
          },
          {
            name: `<a:prt:1448033983383212223> Entrou no server: ${dataEntrada} as ${horaEntrada}`,
            value: "",
            inline: false
          }
        )
        .setFooter({ text: `ID do usuario: ${member.id} | Username ao entrar: ${member.user.username}` })
        .setTimestamp();

      const canal = guild.channels.cache.get(canalBoasVindasID);

      if (canal && canal.isTextBased()) {
        await (canal as TextChannel).send({ embeds: [embed], content: `<@${member.id}>` });
      }
    } catch (err) {
      console.error("Erro no evento de entrada:", err);
    }
  }
};
