const { Client, Message } = require("discord.js");

module.exports = {
    name: "invisible",
    description: "Met le bot en mode invisible.",
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
        client.config.presence.status = "invisible"
        client.saveConfig()
        client.user.setStatus("invisible")
        message.channel.send(`Je suis maintenant en invisible`)
    },
}