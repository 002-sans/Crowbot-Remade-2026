const { Client, Message } = require("discord.js");

module.exports = {
    name: "banclear",
    description: "Supprime les messages récents lors d'un bannissement.",
    category: "Modération",
    argument: "",
    aliases: [],
    permissions: [],
    perm: 3,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /** @param {Client} client @param {Message} message */
    async execute(client, message) {
        const db = client.get(message.guildId);
        db.banclear = 600;
        client.save(message.guildId);
        return message.channel.send("Les messages des utilisateurs bannis datant de jusqu'à 10 minutes seront supprimés");
    },
};
