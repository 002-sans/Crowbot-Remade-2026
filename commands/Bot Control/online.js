const { Client, Message } = require("discord.js");

module.exports = {
    name: "online",
    description: "Met le bot en ligne.",
    category: "Utilitaire",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        client.config.presence.status = "online"
        client.saveConfig()
        client.user.setStatus("online")
        message.channel.send(`Je suis maintenant en ligne`)
    },
}
