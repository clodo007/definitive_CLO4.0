// import {
//   Client,
//   GuildMember,
//   EmbedBuilder,
//   TextChannel,
//   Events,
//   PartialGuildMember,
//   ColorResolvable,
//   AttachmentBuilder
// } from "discord.js";
// import * as path from 'path';

// const PROHIBITED_ROLE_ID_MINOR13 = '1447929091067088956'; 
// const PROHIBITED_ROLE_ID_MINOR14_15 = '1447929122893467770'; 
// const GENERAL_CHANNEL_ID = "1440432088267489470"; 
// const EMBED_COLOR: ColorResolvable = 'Red';
// const GIF_PATH = path.join(__dirname, '../../assets/gifsForEmbedds/minorBan.gif'); 


// export default {
//   name: Events.GuildMemberUpdate,
//   once: false,

//   async execute(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember, client: Client) {
    
//     if (oldMember.roles.cache.size >= newMember.roles.cache.size) {
//         return; 
//     }

//     const roleAdded = newMember.roles.cache.find(role => !oldMember.roles.cache.has(role.id));

//     if (roleAdded && roleAdded.id === PROHIBITED_ROLE_ID_MINOR13||PROHIBITED_ROLE_ID_MINOR14_15) {
        
//         try {
//             await newMember.ban({ 
//                 deleteMessageSeconds: 0, 
//                 reason: "Recebeu o cargo proibido automaticamente via handler." 
//             });
//             console.log(`Usuário ${newMember.user.tag} banido com sucesso.`);

//         } catch (error) {
//             console.error(`Erro fatal ao banir usuário ${newMember.user.tag}.`, error);
//             return; 
//         }

//         let generalChannel: TextChannel | undefined | null;

//         try {
//             generalChannel = await newMember.guild.channels.fetch(GENERAL_CHANNEL_ID) as TextChannel;
//         } catch (error) {
//             console.error('Aviso: Canal geral não encontrado ou inacessível para o bot.', error);
//             return; 
//         }
//             const dataCriacao = `<t:${Math.floor(newMember.user.createdTimestamp / 1000)}:d>`;
//       const horaCriacao = `<t:${Math.floor(newMember.user.createdTimestamp / 1000)}:t>`;
//         if (generalChannel) {
//             try {
//                 const attachment = new AttachmentBuilder(GIF_PATH, { name: 'minor.gif' });

//                 const embed = new EmbedBuilder()
//                     .setTitle('🚨 Conta Suspeita Detectada')
//                     .setDescription(`O usuário **${newMember.user.username}** foi banido do servidor, Após voluntariamente selecionar no Onboarding a opçao **"13 , 14/15"**, Implicando que o dono da conta possivelmente nao cumpre nosso requisito minimo de idade no servidor, que é 16`)
//                     .setColor(EMBED_COLOR)
//                     .addFields(
//                         { name: 'Dados da Conta', value: `username: *${newMember.user.tag}* \nid: **${newMember.id}**`, inline: true },
//                         { name: 'Data de Criaçao desta Conta', value: `${dataCriacao} as ${horaCriacao}`, inline: true }
//                     )
//                     .setThumbnail(newMember.user.displayAvatarURL({ forceStatic: false }))
//                     .setImage('attachment://minor.gif') 
//                     .setTimestamp()

//                 await generalChannel.send({ 
//                     embeds: [embed],
//                     files: [attachment] 
//                 });

//             } catch (error) {
//                 console.error(`Erro ao enviar mensagem embed para o canal geral:`, error);
//             }
//         }
//     }
//   }
// };
