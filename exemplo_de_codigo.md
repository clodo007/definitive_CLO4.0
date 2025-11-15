# Exemplo de Comandos

! Todo codigo de comando possui a seguinte estrutura:

//Ignore as [] e "\_" , elas apenas demonstram as opcoes que podem ser postas
//Dentro dos espaços... por ex: .addStringOption ou .addUserOption

export const data = new SlashCommandBuilder()
.setName(["Nome_do_Comando"])
.setDescription(["Descriçao_do_Comando"])
.add[String,User,Role,Int]Option(([Parametro]) =>
[Parametro].setName("nome da option caso tenha")
.setDescription("descriçao da option")
.setRequired(true)
);

export async function execute(interaction: [Tipo_de_comando]){
...Codigo da Funçao
}

// Geralmente todos comandos com excecao de algum que seja especial
// Segue este formato acima... portanto é possivel copiar e colar caso
// Voce queira

# Exemplo de Eventos

! Todo codigo de Evento possui a seguinte estrutura:

// Todo evento exporta sempre um default, que mostra duas coisas:
// o Nome do Evento, seguido do seu tipo... Event.isChatInputInteraction,
// Events.GuildMemberUpdate, ou etca e o "on" e "once" que respectivamente é
// "Rode sempre que escutar isso" e "Rode uma vez ao escutar isso"

// Logo depoistem a funcao asincrona que executa, usando parametros do tipo do evento,
// No evento de voz por ex: [Events.VoiceStateUpdate] ele recebe os parametros:
// async execute(oldState: VoiceState, newState: VoiceState, client: Client)

export default {
name: Events.[Tipo_de_Evento],
once: false/true,

async execute([Parametros]) {
...Codigo

}
}

# Exemplo de Schema

! Todo schema geralmente utiliza essa estrutura:

// Geralmente o Schema tem algo a ver com a primeira palavara, por isso...
// A melhor saida é por o primeiro nome em ingles, seguido de "Schema"

const [Nome_do_Schema_Em_Ingles]Schema = new mongoose.Schema({

// Aqui vao as propriedades do objeto que voce ta criando, seguidas de seus tipos

    [categoryId]: { type: String, required: true, unique: true, },
    [newRoleID]: { type: String, required: true, },
    [masterOfTheCampaingID]: { type: String, required: true, },
    [generalChannelID]: { type: String, required: true, },
    });

// Aqui finalmente voce invoca o Objeto instanciado... passando para ele o Nome do
// schema, e como voce vai chamar ele no codigo...
// se eu defino o nome do objeto como "Usuario" por exemplo... toda vez que eu
// acessar o Db, eu irei buscar nele usando Usuario.[Propriedade]

export const [Nome_do_Objeto_Instanciado] = mongoose.model([Nome_do_Objeto_Instanciado], [Nome_do_Schema_Em_Ingles]Schema);
