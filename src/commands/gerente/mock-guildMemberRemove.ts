import { ChatInputCommandInteraction, SlashCommandBuilder, GuildMember } from "discord.js";
// Ajuste o caminho de importação para onde você salvou o arquivo do evento de saída.
import guildMemberRemoveEvent from "../../events/guildMemberRemove/saidaDoServidor"; 

export const data = new SlashCommandBuilder()
  .setName("mock-guildmemberremove")
  .setDescription("Simula a saída de um usuário do servidor.")
  .addUserOption(option =>
    option
      .setName("usuario")
      .setDescription("Usuário que será simulado como saindo.")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser("usuario", true);
  const guild = interaction.guild!;

  // Tentamos buscar o membro. O evento de saída funciona mesmo se o membro já não estiver no cache,
  // mas para o propósito do mock, se o usuário alvo não estiver no servidor, não podemos simular a saída dele *desse* servidor.
  const member = await guild.members.fetch(targetUser.id).catch(() => null);

  if (!member) {
    // Se o usuário já não está no servidor (member é null), não podemos "mockar" a saída dele.
    return interaction.reply({
      content: "Esse usuário não está no servidor no momento. Não posso simular a saída de alguém que já saiu.",
      ephemeral: true
    });
  }
  
  // Chama o evento real. 
  // Nota: No evento real, o membro já está "saindo", então não precisamos ajustar timestamps como no evento de entrada.
  // @ts-ignore bypass de tipos só pra simular a chamada direta do execute do evento.
  await guildMemberRemoveEvent.execute(member, interaction.client);

  return interaction.reply({
    content: `Mock de saída executado para ${targetUser.username}. A mensagem de despedida deve ter sido enviada.`,
    ephemeral: true
  });
}
