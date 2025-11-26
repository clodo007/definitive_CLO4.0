import { Client, Role as DiscordRole } from "discord.js";
import { Role } from "../../schemas/rolesSchema";

module.exports = {
  name: "roleCreate",
  async execute(role: DiscordRole, client: Client) {
    try {
      const exists = await Role.findOne({ roleID: role.id });
      if (exists) return;

      const permissions = role.permissions.toArray().map((perm) => ({
        name: perm,
        value: true,
      }));

      await Role.create({
        guildID: role.guild.id,
        roleID: role.id,
        name: role.name,
        color: role.color?.toString(16) || null,
        permissions,
      });

      console.log(`[ROLE CREATE] Cargo registrado no banco: ${role.name}`);
    } catch (err) {
      console.error("[ROLE CREATE] Erro ao registrar cargo:", err);
    }
  },
};
