const { PermissionsBitField, EmbedBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "channel",
    description: "Affiche les informations d'un salon.",
    category: "Utilitaire",
    aliases: ['channelinfo', 'channel-info'],
    permissions: [],
    perm: 1,
    argument: "[channel]",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || await message.guild.channels.fetch(args[0]).catch(() => null);
        if (!channel || !args[0]) channel = message.channel;
 
        const embed = new EmbedBuilder()
            .setColor(db.color)
            .setTitle(`Informations de ${channel.name}`)
            .setDescription(`> **Salon:** ${channel} (\`${channel.name}\` | \`${channel.id}\`)
                > **Sujet**: \`${channel.topic ?? "Aucun"}\`)
                > **Catégorie:** ${channel.parent ?? "\`Aucune\`"}
                > **Type:** \`${type(channel.type)}\`
                > **NSFW:** \`${channel.nsfw ? "✅" : "❌"}\`
                > **Date de création:** <t:${Math.round(channel.createdTimestamp / 1000)}:f> (<t:${Math.round(channel.createdTimestamp / 1000)}:R>)
                > **Mode lent:** \`${formatRateLimit(channel.rateLimitPerUser)}\``.replaceAll('                ', ''))

        message.channel.send({ embeds: [ embed ] })
    },
}

function type(channelType){
    switch(channelType){
        default: return "Salon Textuel"
        case 0: return "Salon Textuel"
        case 2: return "Salon Vocal"
        case 4: return "Catégorie"
        case 5: return "Salon d'Annonces"
        case 11: return "Tread Publique"
        case 12: return "Thread Privé"
        case 13: return "Salon de Conférence"
        case 15: return "Forum"
        case 16: return "Salon Média"
    }
}

function formatRateLimit(seconds) {
    if (seconds === 0) return "Aucun";
    if (seconds < 60) return `${seconds}s`;
    else if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    else if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    else return `${Math.floor(seconds / 86400)}j`;
}