import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder } from "discord.js";

interface ParticipanteIniciativa {
    nome: string;
    bonus: number;
    usuarioId?: string;
}

const listaEsperaIniciativa = new Map<string, ParticipanteIniciativa[]>();

function rolarD20(): number {
    return Math.floor(Math.random() * 20) + 1;
}

export const data = new SlashCommandBuilder()
    .setName("iniciativa")
    .setDescription("Gerencia bônus e rola a iniciativa para todos de uma vez.")
    .addSubcommand(subcommand =>
        subcommand
            .setName("bonus")
            .setDescription("Define seu bônus de iniciativa.")
            .addIntegerOption(option =>
                option.setName("valor")
                    .setDescription("O valor do seu bônus (ex: 2, -1, 5)")
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName("inimigo")
            .setDescription("Adiciona um NPC ou inimigo à lista (apenas Mestre).")
            .addStringOption(option =>
                option.setName("nome")
                    .setDescription("Nome do inimigo/NPC.")
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName("bonus")
                    .setDescription("O bônus de iniciativa do inimigo.")
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName("rolar")
            .setDescription("Rola 1d20 + bônus para todos os participantes registrados e exibe a ordem."));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId || !interaction.channelId) {
        await interaction.reply({ content: "Este comando só pode ser usado em um servidor (guilda).", ephemeral: true });
        return;
    }

    const channelId = interaction.channelId;
    const subcommand = interaction.options.getSubcommand();

    if (!listaEsperaIniciativa.has(channelId)) {
        listaEsperaIniciativa.set(channelId, []);
    }
    const lista = listaEsperaIniciativa.get(channelId)!;

    switch (subcommand) {
        case "bonus":
            await handleSetBonus(interaction, lista);
            break;
        case "inimigo":
            await handleAddInimigo(interaction, lista);
            break;
        case "rolar":
            await handleRolarTudo(interaction, channelId, lista);
            break;
    }
}

async function handleSetBonus(interaction: ChatInputCommandInteraction, lista: ParticipanteIniciativa[]): Promise<void> {
    const bonus = interaction.options.getInteger("valor")!;
    const usuarioId = interaction.user.id;
    const nome = interaction.user.displayName;

    const index = lista.findIndex(item => item.usuarioId === usuarioId);

    if (index > -1) {
        lista[index].bonus = bonus;
        await interaction.reply({ content: `Seu bônus de iniciativa foi atualizado para **+${bonus}**.`, ephemeral: true });
    } else {
        lista.push({ nome, bonus, usuarioId });
        await interaction.reply({ content: `Você (${nome}) registrou um bônus de **+${bonus}** para a próxima rolagem.`, ephemeral: true });
    }
}

async function handleAddInimigo(interaction: ChatInputCommandInteraction, lista: ParticipanteIniciativa[]): Promise<void> {
    const nome = interaction.options.getString("nome")!;
    const bonus = interaction.options.getInteger("bonus")!;

    lista.push({ nome, bonus });
    
    await interaction.reply({ content: `Inimigo/NPC **${nome}** (Bônus: +${bonus}) adicionado à lista de espera.`, ephemeral: true });
}

async function handleRolarTudo(interaction: ChatInputCommandInteraction, channelId: string, lista: ParticipanteIniciativa[]): Promise<void> {
    if (lista.length === 0) {
        await interaction.reply({ content: "Ninguém registrou bônus ainda. Use `/iniciativa bonus`.", ephemeral: true });
        return;
    }

    const resultadosFinais: { nome: string, total: number, rolagem: number, bonus: number }[] = [];

    for (const participante of lista) {
        const rolagemD20 = rolarD20();
        const total = rolagemD20 + participante.bonus;
        resultadosFinais.push({
            nome: participante.nome,
            total,
            rolagem: rolagemD20,
            bonus: participante.bonus
        });
    }

    resultadosFinais.sort((a, b) => b.total - a.total || b.rolagem - a.rolagem);

    const embed = new EmbedBuilder()
        .setTitle(`<a:dic:1448034244512452669> Resultado da Iniciativa para ${interaction.channel!} <a:dic:1448034244512452669>`)
        .setColor(0xFF4500)
        .setDescription("Ordem de combate (do maior para o menor):");

    const campos = resultadosFinais.map((item, index) => ({
        name: `${index + 1}. ${item.nome}`,
        value: `Total: **${item.total}** (d20: ${item.rolagem} | Bônus: ${item.bonus >= 0 ? '+' : ''}${item.bonus})`,
        inline: false,
    }));

    embed.addFields(campos);

    await interaction.reply({ embeds: [embed], ephemeral: false });

    listaEsperaIniciativa.delete(channelId);
}
