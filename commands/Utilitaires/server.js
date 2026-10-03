const { PermissionsBitField, EmbedBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "server",
    description: "Permet de récupérer l'icône du serveur.",
    category: "Utilitaire",
    aliases: [ 'servericon', 'icone' ],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const embed = new EmbedBuilder().setColor(db.color)


        switch(args[0]){
            case 'pic':
                if (message.guild.icon) embed.setImage(message.guild.iconURL({ size: 4096 }));
                else embed.setDescription("Le serveur n'a pas d'icon");
                message.channel.send({ embeds: [ embed ] });
                break;

            case 'banner':
                if (message.guild.banner) embed.setImage(message.guild.bannerURL({ size: 4096 }));
                else embed.setDescription("Le serveur n'a pas de bannière");                        
                message.channel.send({ embeds: [ embed ] });
                break;
            
        }
            
                
    },
}