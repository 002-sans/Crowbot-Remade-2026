const { Client, Message } = require("discord.js")

module.exports = {
    name: "sync",
    description: "Synchronise les permissions des salons du serveur à leurs catégories",
    category: "Gestion",
    aliases: [],
    permissions: [],
    argument: "<catégorie/salon/all> [salon]",
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (args[0] === "all"){
            message.guild.channels.cache.filter(c => c.type !== 4 && c.parentId).forEach(channel => channel.lockPermissions().catch(() => null))
            message.channel.send("Synchronisation de tous les salons du serveur terminé")
        }
        else {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel
            
            if (channel.type === 4){
                channel.children.cache.forEach((children) => {
                    children.lockPermissions().catch(() => null)
                })

                message.channel.send(`Synchronisation des salons de ${channel} terminé`)
            }
            else {
                channel.lockPermissions()
                .then( () => message.channel.send(`Synchronisation du salon ${channel} terminé`))
                .catch(() => message.channel.send(`Impossible de synchroniser le salon ${channel}`));
            }            
        }

    }
}