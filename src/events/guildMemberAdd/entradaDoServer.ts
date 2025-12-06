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

   

      const dataCriacao = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`;
      const dataEntrada = `<t:${Math.floor(member.joinedTimestamp! / 1000)}:F>`;


      const embed = new EmbedBuilder()
        .setColor(0x00aaff)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .setTitle("🎉 Novo hóspede chegou ao Hotel!")
        .setDescription(
          `Seja muito bem-vindo, ${member}!\n\n` +
            `Aqui estão algumas informações importantes sobre sua entrada no servidor.\n\n` +
            `📜 Leia as regras: <#${canalRegrasID}>\n` +
            `🚪 Complete o onboarding: <#${canalOnboardingID}>`
        )
        .addFields(
          {
            name: `📅 Conta criada em: ${dataCriacao}`,
            value: "",
            inline: true
          },
          {
            name: `📥 Entrou no server em: ${dataEntrada}`,
            value: "",
            inline: false
          },
          {
            name: `🏷 Cargos recebidos automaticamente:`,
            value: cargosTexto
          }
        )
        .setFooter({ text: "Sistema de Entrada do CLO" })
        .setTimestamp();

      const canal = guild.channels.cache.get(canalBoasVindasID);

      if (canal && canal.isTextBased()) {
        await (canal as TextChannel).send({ embeds: [embed] });
      }
    } catch (err) {
      console.error("Erro no evento de entrada:", err);
    }
  }
};
