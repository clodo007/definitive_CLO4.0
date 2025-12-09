import { GuildMember, Client, EmbedBuilder } from "discord.js";
import { Role } from "../../schemas/rolesSchema";
import { Category } from "../../schemas/categorySchema";
import { User } from "../../schemas/userSchema";

export default {
  name: "guildMemberRemove",
  async execute(member: GuildMember, client: Client) {
    const guildID = member.guild.id;
    const userID = member.id;

    const rolesDb = await Role.find({ guildID });
    const campaignRoles = rolesDb.filter(r => r.isCampaignRole);
    const memberCampaignRoles = member.roles.cache.filter(r => campaignRoles.some(c => c.roleID === r.id));

    if (memberCampaignRoles.size === 0) return;

    const role = memberCampaignRoles.first();
    const category = await Category.findOne({ "campaignData.newRoleID": role!.id, guildID });
    if (!category || !category.campaignData) return;

    const masterID = category.campaignData.masterID;
    const generalChannelID = category.campaignData.generalChannelID;

    const userEmbed = new EmbedBuilder()
      .setTitle("Banimento Permanente")
      .setDescription(
        "Você saiu do servidor enquanto participava de uma mesa, o que viola nossas regras internas.\n\n" +
        "Portanto, você foi **Banido Permanentemente** sem possibilidade de retorno.\n\n" +
        "Acredita que houve um engano?\n" +
        "Entre em contato com qualquer membro da gerência."
      )
      .setColor("DarkRed");

    try {
      await member.send({ embeds: [userEmbed] });
    } catch {}

    const master = await client.users.fetch(masterID).catch(() => null);

    if (master) {
      const masterEmbed = new EmbedBuilder()
        .setTitle("Jogador Removido da Mesa")
        .setDescription(
          `O jogador **${member.user.tag}** saiu do servidor enquanto possuia uma tag de **SUA** Mesa ou Campanha.\n\n` +
          "O usuário foi **banido automaticamente**."
        )
        .setColor("Orange");

      master.send({ embeds: [masterEmbed] }).catch(() => {});
    }

    const channel = member.guild.channels.cache.get(generalChannelID);
    if (channel && channel.isTextBased()) {
      const notifyEmbed = new EmbedBuilder()
        .setTitle("Jogador Saiu do Servidor")
        .setDescription(
          `O jogador **${member.user.tag}** deixou o servidor durante a campanha.\n` +
          "Como previsto nas regras, ele foi **banido automaticamente**."
        )
        .setColor("Orange");

      channel.send({ embeds: [notifyEmbed] });
    }

    await member.guild.members.ban(userID, {
      reason: "Saiu do servidor durante participação em uma campanha."
    });

    await User.findOneAndUpdate({ userID, guildID }, { isActive: false });
  }
};
