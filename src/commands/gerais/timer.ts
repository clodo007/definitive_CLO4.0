import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const activeIntervals = new Map<string, NodeJS.Timeout>();
const MAX_TIMER_DURATION_MS = 3600000;
const INTERACTION_LIFESPAN_MS = 900000;
const GRACE_PERIOD_MS = 5000;

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${pad(minutes)}:${pad(remainingSeconds)}`;
}

export const data = new SlashCommandBuilder()
    .setName("timer")
    .setDescription("Cria um timer individual (máximo 1 hora, renova a cada 15 min)")
    .addNumberOption((Option)=> 
        Option.setName("segundos").setDescription("quantos segundos?").setRequired(false))
    .addNumberOption((Option) =>
        Option.setName("minutos").setDescription("quantos minutos?").setRequired(false)    
    )
     .addBooleanOption((Option) =>
        Option.setName("finalizar").setDescription("encerra qualquer timer ativo seu").setRequired(false)    
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const minutesNumber = interaction.options.getNumber("minutos") ?? 0;
    const secondsNumber = interaction.options.getNumber("segundos") ?? 0;
    const shouldCancel = interaction.options.getBoolean("finalizar") ?? false;

    const userId = interaction.user.id;
    const channelId = interaction.channelId;
    const timerKey = `${userId}-${channelId}`;
    
    if (shouldCancel) {
        if (activeIntervals.has(timerKey)) {
            clearInterval(activeIntervals.get(timerKey)!);
            activeIntervals.delete(timerKey);
            return interaction.reply({ 
                content: "✅ Seu timer ativo foi cancelado com sucesso.", 
                ephemeral: true 
            });
        } else {
            return interaction.reply({ 
                content: "Você não tem nenhum timer ativo para cancelar.", 
                ephemeral: true 
            });
        }
    }

    let totalSecondsRemaining = minutesNumber * 60 + secondsNumber;
    const totalMilliseconds = totalSecondsRemaining * 1000;

    if (totalSecondsRemaining <= 0) {
        return interaction.reply({ content: "O timer precisa ser maior que 0 segundos.", ephemeral: true });
    }
    if (totalMilliseconds > MAX_TIMER_DURATION_MS) {
        return interaction.reply({ content: "O timer não pode durar mais de 1 hora.", ephemeral: true });
    }
    
    if (activeIntervals.has(timerKey)) {
        return interaction.reply({ 
            content: "Você já possui um timer ativo neste canal. Use `/timer finalizar:Sim` para cancelar.", 
            ephemeral: true 
        });
    }
    
    await interaction.reply({
        content: `Timer iniciado para <@${interaction.user.id}>: **${formatTime(totalSecondsRemaining)}** restante.`
    });

    const manageTimerLoop = async () => {
        
        const intervalId = setInterval(async () => {
            totalSecondsRemaining--;

            const elapsedTimeSinceStart = totalMilliseconds - (totalSecondsRemaining * 1000);
            
            if (elapsedTimeSinceStart >= INTERACTION_LIFESPAN_MS - GRACE_PERIOD_MS && totalSecondsRemaining > 0) {
                
                clearInterval(activeIntervals.get(timerKey)!); 

                await interaction.followUp({
                    content: `⏳ Renovando timer para ${interaction.user.username}: **${formatTime(totalSecondsRemaining)}** restante.`,
                });
                
                manageTimerLoop(); 
                
            } else if (totalSecondsRemaining > 0) {
                try {
                    await interaction.editReply({
                        content: `Timer iniciado para <@${interaction.user.id}>: **${formatTime(totalSecondsRemaining)}** restante.`
                    });
                } catch (e) {
                    console.error("Falha ao editar mensagem:", e);
                    clearInterval(intervalId);
                    activeIntervals.delete(timerKey);
                }
            } else {
                clearInterval(intervalId);
                activeIntervals.delete(timerKey);

                try {
                     await interaction.followUp({
                        content: `⏰ **Trrrrring!** O seu timer terminou, <@${interaction.user.id}>!`,
                        ephemeral: false
                    });
                } catch (e) {
                     console.error("Falha ao enviar mensagem final via followUp:", e);
                }
            }
        }, 1000);

        activeIntervals.set(timerKey, intervalId);
    };

    manageTimerLoop();
}
