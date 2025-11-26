import { Client, Role as DiscordRole } from "discord.js";
import { Role as RoleModel } from "../../schemas/rolesSchema";

module.exports = {
  name: "roleUpdate",

  async execute(oldRole: DiscordRole, newRole: DiscordRole, client: Client) {
    try {
      // Buscar no banco
      const roleDoc = await RoleModel.findOne({ roleID: newRole.id });
      if (!roleDoc) return;

      let edited = false;

      // Atualizar nome
      if (oldRole.name !== newRole.name) {
        roleDoc.name = newRole.name;
        edited = true;
      }

      // Atualizar cor
      if (oldRole.color !== newRole.color) {
        roleDoc.color = newRole.color.toString();
        edited = true;
      }

      // Atualizar permissões
      if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
        roleDoc.permissions = newRole.permissions.toArray().map((perm) => ({
          name: perm,
          value: true,
        }));
        edited = true;
      }

      if (edited) {
        await roleDoc.save();
        console.log(`🔄 [ROLE UPDATE] Cargo atualizado: ${newRole.name}`);
      }
    } catch (err) {
      console.error("[ROLE UPDATE] Erro ao atualizar o cargo:", err);
    }
  },
};
