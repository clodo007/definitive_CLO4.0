import { SlashCommandBuilder, CommandInteraction, EmbedBuilder, ChannelType, ChatInputCommandInteraction, AuditLogEvent } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('hotel')
    .setDescription('Comandos administrativos e de status para o Hotel.')
    .setDefaultMemberPermissions(8192)
    .addSubcommand(subcommand =>
        subcommand.setName('desbanir')
            .setDescription('Desbane um usuário do servidor pelo ID.')
            .addStringOption(option =>
                option.setName('id')
                    .setDescription('O ID do usuário a ser desbanido')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand.setName('checkban')
            .setDescription('Verifica se um usuário foi banido e mostra detalhes.')
            .addStringOption(option =>
                option.setName('id')
                    .setDescription('O ID do usuário a ser verificado')
                    .setRequired(true)
            )
    )
    .addSubcommandGroup(group =>
        group.setName('status')
            .setDescription('Verifica o status do servidor ou de mesas específicas.')
            .addSubcommand(subcmd =>
                subcmd.setName('server')
                    .setDescription('Mostra um embed com infos relevantes do hotel (servidor).')
            )
            .addSubcommand(subcmd =>
                subcmd.setName('mesa')
                    .setDescription('Informações detalhadas de uma mesa específica.')
                    .addStringOption(option =>
                        option.setName('nome_da_mesa')
                            .setDescription('Nome ou ID do canal da mesa')
                            .setRequired(true)
                    )
            )
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
        return interaction.reply({ content: 'Este comando só pode ser usado em um servidor.', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const subcommandGroup = interaction.options.getSubcommandGroup();

    if (subcommand === 'desbanir') {
        const userId = interaction.options.getString('id', true);
        try {
            await interaction.guild.members.unban(userId);
            
            const banInfo = await interaction.guild.bans.fetch(userId);
            const embed = new EmbedBuilder()
                .setTitle(`Usuário Des-Banido: ${banInfo.user.tag}`)
                .setColor(0x00FF00)
                .setThumbnail(banInfo.user.displayAvatarURL({ forceStatic: false }))
                .addFields(
        { name: '<a:htg:1448033948876673134> ID do Usuário', value: banInfo.user.id, inline: true },
        { name: '<a:nbd:1448041868960075786> Conta Criada em', value: banInfo.user.createdAt.toDateString(), inline: true },
       
    )
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Não foi possível desbanir. Verifique o ID e permissões.', ephemeral: true });
        }
    } else if (subcommand === 'checkban') {
        const userId = interaction.options.getString('id', true);
        try {
            const banInfo = await interaction.guild.bans.fetch(userId);
            let reason = banInfo.reason || 'Nenhum motivo fornecido';

            if (!banInfo.reason) {
                const auditLogs = await interaction.guild.fetchAuditLogs({
                    type: AuditLogEvent.MemberBanAdd,
                    limit: 5
                });
                const banLogEntry = auditLogs.entries.find(entry => entry.target!.id === userId);
                
                if (banLogEntry && banLogEntry.reason) {
                    reason = banLogEntry.reason;
                }
            }

            const embed = new EmbedBuilder()
                .setTitle(`Usuário Banido: ${banInfo.user.username} <a:banhmr:1448050294066905168>`)
                .setColor(0xFF0000)
                .setThumbnail(banInfo.user.displayAvatarURL({ forceStatic: false }))
                .addFields(
                    { name: '<a:htg:1448033948876673134> ID do Usuário', value: banInfo.user.id, inline: true },
                    { name: '<a:nbd:1448041868960075786> Conta Criada em', value: banInfo.user.createdAt.toDateString(), inline: true },
                    { name: '<a:gbcth:1448051346908512256> Motivo do Banimento', value: reason, inline: false }
                )
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: `O usuário ${userId} não está banido.`, ephemeral: true });
        }
    } else if (subcommandGroup === 'status') {
        if (subcommand === 'server') {
            const channelCounts = interaction.guild.channels.cache.reduce((acc, channel) => {
                if (channel.type === ChannelType.GuildText) acc.text++;
                else if (channel.type === ChannelType.GuildVoice) acc.voice++;
                else if (channel.type === ChannelType.GuildCategory) acc.category++;
                return acc;
            }, { text: 0, voice: 0, category: 0 });

            const mesasAtivasRole = interaction.guild.roles.cache.find(role => role.name === 'Mesas Ativas');
            const hiatoRole = interaction.guild.roles.cache.find(role => role.name === 'Hiato');
            
            const embed = new EmbedBuilder()
                .setTitle(`Status do Hotel ${interaction.guild.name}`)
                .addFields(
                    { name: 'Total de Membros', value: interaction.guild.memberCount.toString(), inline: true },
                    { name: 'Total de Canais', value: channelCounts.category.toString() || 'N/A', inline: true },
                    { name: 'Membros em "Mesas Ativas"', value: mesasAtivasRole?.members.size.toString() || 'N/A', inline: true },
                    { name: 'Membros em "Hiato"', value: hiatoRole?.members.size.toString() || 'N/A', inline: true }
                );
            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'mesa') {
            const tableName = interaction.options.getString('nome_da_mesa', true);
            await interaction.reply(`Buscando detalhes para a mesa: ${tableName}. (Implementação do DB necessária)`);
        }
    }
}
