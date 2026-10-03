const { Client, Message } = require("discord.js");

module.exports = {
    name: "claim",
    description: "Permet de claim un ticket",
    category: "Configuration du serveur",
    argument: "",
    aliases: [],
    permissions: [],
    perm: 7,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        const ticket = (db.tickets?.open || []).find(t => t.channelId === message.channel.id);
        if (!ticket) return message.channel.send("Cette commande doit être utilisée dans un ticket");
        ticket.claimedBy = message.author.id;
        client.save(message.guildId);
        message.channel.send(`Ticket **claim** par ${message.author}`);

    },
};
