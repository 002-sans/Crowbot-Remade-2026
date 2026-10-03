const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "emoji",
    description: "Récupère l'image d'un émoji",
    category: "Utilitaire",
    argument: "<émoji>",
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        const match = args[0]?.match(/<a?:(\w+):(\d+)>/);
        const emoji = match
            ? { name: match[1], id: match[2], animated: args[0].startsWith('<a:') }
            : message.guild.emojis.cache.find(e => e.name === args[0] || e.id === args[0]);
        if (!emoji) return message.channel.send(`Aucun émoji de trouvé pour \`${args[0] ?? "rien"}\``);
        const url = emoji.url || `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}?size=1024`;
        const embed = new EmbedBuilder().setColor(db.color).setImage(url).setTitle(emoji.name || 'Emoji');
        message.channel.send({ embeds: [embed] });

    },
};
