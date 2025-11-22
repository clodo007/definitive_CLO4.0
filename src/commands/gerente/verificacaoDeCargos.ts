import { ChatInputCommandInteraction } from "discord.js";
import { User } from "../../schemas/userSchema";
export async function canUseCommand(
  interaction: ChatInputCommandInteraction,
  requiredFlags: string[]
): Promise<boolean> {
  const discordId = interaction.user.id;
  const userData = await User.findOne({ discordId }).lean();

  if (!userData) return false;

  for (const flag of requiredFlags) {
    if (userData[flag as keyof typeof userData] === true) return true;
  }

  return false;
}
