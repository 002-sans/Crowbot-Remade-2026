const { Client, Message } = require("discord.js");

module.exports = {
    name: "messageDelete",
        /**
     * @param {Client} client
     * @param {Message} message
    */
    async execute(client, message) {
        if (message.channel.isDMBased()) return;
        if (!message.content || !message.author) return;

        if (!client.snipes.get(message.channel.id)) client.snipes.set(message.channel.id, [])
        if (client.snipes.get(message.channel.id).length > 10) client.snipes.get(message.channel.id).splice(10, 1)

        client.snipes.get(message.channel.id).push({
            content: message.content ? message.content : "Aucun message",
            author: message.author,
            moment: Date.now(),
            images: message.attachments.first()?.url ? message.attachments.first()?.url : null
        })
    }
}