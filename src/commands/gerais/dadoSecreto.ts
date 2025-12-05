import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
.setName("dado-secreto").setDescription("Roda um Dado que Somente Voce ve").addStringOption((option)=>
option.setName("dado").setDescription("Digite o dado que voce quer"))

export async function execute(interaction: ChatInputCommandInteraction){



    
}