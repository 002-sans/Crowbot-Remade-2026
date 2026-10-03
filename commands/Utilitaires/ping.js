const { PermissionsBitField, EmbedBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "ping",
    description: "Afficher le ping du bot.",
    category: "Utilitaire",
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const embed = new EmbedBuilder()
            .setColor(db.color)
            .addFields({ name: "***WS***", value: `\`${client.ws.ping}ms\``, inline: true })
            
        const msg = await message.channel.send({ embeds: [ embed ] })

        embed.addFields({ name: "***REST***", value: `\`${msg.createdAt - message.createdAt}ms\``, inline: true })
        msg.edit({ embeds: [ embed ] })
    },
}