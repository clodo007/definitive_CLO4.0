import { Client, Role } from "discord.js";
import { Role as RoleModel } from "../../schemas/rolesSchema";

export default {
  name: "roleDelete",

  async execute(role: Role, client: Client) {
    try {
      if (!role || !role.id) return;

      const roleDoc = await RoleModel.findOne({ roleID: role.id });
      if (!roleDoc) return;

      await RoleModel.deleteOne({ roleID: role.id });

      console.log(`[ROLE DELETE] Cargo removido do banco: ${role.name} (${role.id})`);
    } catch (err) {
      console.error("[ROLE DELETE] Erro ao remover cargo do banco:", err);
    }
  },
};
