const { Client, Message } = require("discord.js");

module.exports = {
    name: "dnd",
    description: "Met le bot en mode ne pas déranger.",
    category: "Bot Control",
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
        client.config.presence.status = "dnd"
        client.saveConfig()
        client.user.setStatus("dnd")
        message.channel.send(`Je suis maintenant en ne pas déranger`)
    },
}