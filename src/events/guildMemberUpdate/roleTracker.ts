import { GuildMember } from "discord.js";
import { Role } from "../../schemas/rolesSchema";
import { User } from "../../schemas/userSchema";

const roleFlagMap = {
    isMasterRole: 'isMaster',
    isArtistRole: 'isArtist',
    isPartnerRole: 'isPartner',
    isBoosterRole: 'isBooster',
    isGuestRole: 'isGuest',
};


async function getFlagUpdates(member: GuildMember) {
    const userUpdates: Record<string, boolean> = {};
    const roleIds = Array.from(member.roles.cache.keys());

    const dbRoles = await Role.find({
        guildID: member.guild.id,
        roleID: { $in: roleIds }
    });

    for (const [roleKey, userKey] of Object.entries(roleFlagMap)) {
        const hasFlag = dbRoles.some(dbRole => {
            const value = (dbRole as unknown as Record<string, unknown>)[roleKey];
            return value === true;
        });

        userUpdates[userKey] = hasFlag;
    }

    return userUpdates;
}


module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember: GuildMember, newMember: GuildMember) {
    try {
      const guildId = newMember.guild.id;
      const userId = newMember.user.id;
      const updates: any = {};

      const oldRoles = oldMember.roles.cache;
      const newRoles = newMember.roles.cache;

      const rolesAdded = newRoles.filter(role => !oldRoles.has(role.id));
      const rolesRemoved = oldRoles.filter(role => !newRoles.has(role.id));

      if (rolesAdded.size > 0) {
        for (const [roleId, role] of rolesAdded) {
          await Role.findOneAndUpdate(
            { guildID: guildId, roleID: roleId },
            { 
              $addToSet: { membersWhoHasTheRole: userId },
              name: role.name, color: role.hexColor,
            },
            { upsert: true }
          );
        }
        updates.$addToSet = { roles: Array.from(rolesAdded.keys()) };
      }

      if (rolesRemoved.size > 0) {
        for (const [roleId] of rolesRemoved) {
          await Role.findOneAndUpdate(
            { guildID: guildId, roleID: roleId },
            { $pull: { membersWhoHasTheRole: userId } }
          );
        }
         updates.$pull = { roles: Array.from(rolesRemoved.keys()) };
      }
      
      if (rolesAdded.size > 0 || rolesRemoved.size > 0) {
        const flagUpdates = await getFlagUpdates(newMember);
        updates.$set = { ...updates.$set, ...flagUpdates, username: newMember.user.username };
      }

      if (Object.keys(updates).length > 0) {
          await User.updateOne(
            { guildID: guildId, userID: userId },
            updates,
            { upsert: true }
          );
      }
    } catch (error) {
      console.error(error);
    }
  },
};
