import { ChatInputCommandInteraction, SlashCommandBuilder, GuildMember } from "discord.js";
import guildMemberAddEvent from "../../events/guildMemberAdd/entradaDoServer";

export const data = new SlashCommandBuilder()
  .setName("mock-guildmemberadd")
  .setDescription("Simula a entrada de um usuário no servidor")
  .addUserOption(option =>
    option
      .setName("usuario")
      .setDescription("Usuário que será simulado como novo membro")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const fakeUser = interaction.options.getUser("usuario", true);
  const guild = interaction.guild!;

  const member = await guild.members.fetch(fakeUser.id).catch(() => null);

  if (!member)
    return interaction.reply({
      content: "Esse usuário não está no servidor, então não posso mockar.",
      ephemeral: true
    });

  // Simula como se ele tivesse acabado de entrar AGORA
  member.joinedTimestamp = Date.now();

  // Chama o evento real
  // @ts-ignore bypass de tipos só pra simular
  await guildMemberAddEvent.execute(member, interaction.client);

  return interaction.reply({
    content: `Mock de entrada executado para ${fakeUser}.`,
    ephemeral: true
  });
}
