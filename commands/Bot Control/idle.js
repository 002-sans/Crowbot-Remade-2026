const { Client, Message } = require("discord.js");

module.exports = {
    name: "idle",
    description: "Met le bot en mode inactif.",
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
        client.config.presence.status = "idle"
        client.saveConfig()
        client.user.setStatus("idle")
        message.channel.send(`Je suis maintenant inactif`)
    },
}