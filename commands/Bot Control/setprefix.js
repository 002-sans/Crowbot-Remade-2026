const { Client, Message } = require("discord.js");

module.exports = {
    name: "setprefix",
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
        const db = client.get(message.guildId);
        if (!args[0]) return message.channel.send('Veuillez entrer une activitée valide');

        if (!args[0]) return message.channel.send("Veuillez entrer un prefix valide");
        if (db.prefix == args[0]) return message.channel.send("Veuillez choisir un prefix différent du prefix actuel");

        db.prefix = args[0];
        client.save(message.guildId)
        message.channel.send(`Votre nouveau prefix sur le serveur est \`${db.prefix}\``)
    },
}