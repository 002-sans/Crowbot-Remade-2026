const { Client, Message } = require("discord.js");

module.exports = {
    name: "raidmode",
    description: "Permet d'empêcher de rejoindre le serveur.",
    category: "Antiraid",
    aliases: [],
    permissions: [],
    perm: 6,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (!message.guild.features.includes("COMMUNITY"))
            return message.channel.send("Veuillez activer la communauté du serveur pour profiter de cette commande");

        if (message.guild.features.includes('INVITES_DISABLED')){
            message.guild.disableInvites(false)
            message.channel.send("Les invitations du serveur ne sont plus en pause")
        }
        else {
            message.guild.disableInvites(true)
            message.channel.send("Les invitations du serveur ont été mise en pause")
        }
    },
}
