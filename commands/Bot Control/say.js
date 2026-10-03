const { Client, Message } = require("discord.js");

module.exports = {
    name: "say",
    description: "Faire dire un message au bot",
    category: "Bot Control",
    argument: "<texte>",
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
        if (!args[0]) return message.channel.send("Veuillez entrer un texte valide");

        message.delete();
        return message.channel.send(args.join(' '));
    },
}