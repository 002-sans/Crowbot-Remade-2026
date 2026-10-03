const { Client, Message } = require("discord.js");

module.exports = {
    name: "mainprefix",
    description: "Modifie le prefix du bot dans un serveur ou globalement",
    category: "Bot Control",
    argument: "[global] <prefix>",
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
        if (!args[0]) return message.channel.send("Veuillez entrer un prefix valide");
        if (client.config.prefix == args[0]) return message.channel.send("Veuillez choisir un prefix différent du prefix actuel");

        client.config.prefix = args[0];
        client.saveConfig()
        message.channel.send(`Votre nouveau prefix globale est \`${client.config.prefix}\``)
        
    },
}