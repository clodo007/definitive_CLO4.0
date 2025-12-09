import {
  Client,
  GuildMember,
  EmbedBuilder,
  TextChannel,
  Events,
  PartialGuildMember,
  ColorResolvable,
  AttachmentBuilder
} from "discord.js";
import * as path from 'path';

// Centralize todos os IDs e configurações
const PROHIBITED_ROLE_ID_MINOR13 = '1447929091067088956'; 
const PROHIBITED_ROLE_ID_MINOR14_15 = '1447929122893467770'; 
const PROHIBITED_ROLE_ID_BOT = '1447571877051764912'; 

const GENERAL_CHANNEL_ID = "1440432088267489470"; 
const EMBED_COLOR: ColorResolvable = 'Red';
const GIF_PATH_MINOR = path.join(__dirname, '../../assets/gifsForEmbedds/minorBan.gif'); 
const GIF_PATH_BOT = path.join(__dirname, '../../assets/gifsForEmbedds/lock-missile.gif'); 
const GIF_PATH_SECURE_BOT = path.join(__dirname, '../../assets/gifsForEmbedds/matrixBot.gif'); 


export default {
  name: Events.GuildMemberUpdate,
  once: false,

  async execute(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember, client: Client) {
    
    if (oldMember.roles.cache.size >= newMember.roles.cache.size) {
        return; 
    }

    const roleAdded = newMember.roles.cache.find(role => !oldMember.roles.cache.has(role.id));

    const prohibitedRoleIds = [PROHIBITED_ROLE_ID_MINOR13, PROHIBITED_ROLE_ID_MINOR14_15, PROHIBITED_ROLE_ID_BOT];

    if (!roleAdded || !prohibitedRoleIds.includes(roleAdded.id)) {
        return;
    }

    try {
        await newMember.ban({ 
            deleteMessageSeconds: 0, 
            reason: `Recebeu o cargo proibido (${roleAdded.id}) automaticamente via handler unificado.` 
        });
        console.log(`Usuário ${newMember.user.tag} banido com sucesso pelo cargo: ${roleAdded.name}`);

    } catch (error) {
        console.error(`Erro fatal ao banir usuário ${newMember.user.tag}.`, error);
        return; 
    }

    
    let generalChannel: TextChannel | undefined | null;

    try {
        generalChannel = await newMember.guild.channels.fetch(GENERAL_CHANNEL_ID) as TextChannel;
    } catch (error) {
        console.error('Aviso: Canal geral não encontrado ou inacessível para o bot.', error);
        return; 
    }
        
    const dataCriacao = `<t:${Math.floor(newMember.user.createdTimestamp / 1000)}:d>`;
    const horaCriacao = `<t:${Math.floor(newMember.user.createdTimestamp / 1000)}:t>`;

    if (generalChannel) {
        let title = '<a:srn:1448034161939058890> Conta Suspeita Detectada';
        let description = '';
        let gifPath = '';
        let attachmentName = '';

        if (roleAdded.id === PROHIBITED_ROLE_ID_BOT) {
            description = `O usuário **${newMember.user.username}** foi banido. Selecionou a opção **"Sou um bot"**, implicando que a conta é suspeita ou possui um dono iletrado.`;
            gifPath = GIF_PATH_BOT;
            attachmentName = 'lock.gif';
        } else if(roleAdded.id === PROHIBITED_ROLE_ID_MINOR13||PROHIBITED_ROLE_ID_MINOR14_15){ 
            description = `O usuário **${newMember.user.username}** foi banido. Selecionou no Onboarding a opção **"13, 14/15"**, implicando que o dono da conta possivelmente não cumpre nosso requisito mínimo de idade (16).`;
            gifPath = GIF_PATH_MINOR;
            attachmentName = 'minor.gif';
        } else if (roleAdded.id === PROHIBITED_ROLE_ID_BOT && PROHIBITED_ROLE_ID_MINOR13){
            description = `O usuário **${newMember.user.username}** foi banido. Selecionou no Onboarding ambas opçoes de "Ser um Bot" e "Ser menor que 16 anos", implicando que essa conta possivelmente seja um Bot Spyware ou de Anuncio`;
            gifPath = GIF_PATH_SECURE_BOT;
            attachmentName = 'matrix.gif';
        }

        try {
            const attachment = new AttachmentBuilder(gifPath, { name: attachmentName });

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(EMBED_COLOR)
                .addFields(
                    { name: 'Dados da Conta', value: `<a:modb:1448034019173339329> username: *${newMember.user.tag}* \n<a:htg:1448033948876673134> id: **${newMember.id}**`, inline: true },
                    { name: 'Data de Criação desta Conta', value: `<a:nbd:1448041868960075786> ${dataCriacao} às ${horaCriacao}`, inline: true }
                )
                .setThumbnail(newMember.user.displayAvatarURL({ forceStatic: false }))
                .setImage(`attachment://${attachmentName}`) 
                .setTimestamp()

            await generalChannel.send({ 
                embeds: [embed],
                files: [attachment] 
            });

        } catch (error) {
            console.error(`Erro ao enviar mensagem embed para o canal geral:`, error);
        }
    }
  }
};
