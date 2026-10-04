const { EmbedBuilder, Client, Message, ChannelType } = require("discord.js");

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
        let channel = message.mentions.channels.first()
            || message.guild.channels.cache.get(args[0])
            || await message.guild.channels.fetch(args[0]).catch(() => null);
        if (!channel || !args[0]) channel = message.channel;

        const lines = [
            `> **Salon:** ${channel} (\`${channel.name}\` | \`${channel.id}\`)`,
            `> **Sujet**: \`${channel.topic ?? "Aucun"}\``,
            `> **Catégorie:** ${channel.parent ?? "`Aucune`"}`,
            `> **Type:** \`${channelTypeLabel(channel.type)}\``,
        ];

        if (channel.isTextBased?.()) {
            lines.push(`> **NSFW:** \`${channel.nsfw ? "✅" : "❌"}\``);
            lines.push(`> **Mode lent:** \`${formatRateLimit(channel.rateLimitPerUser ?? 0)}\``);
        }

        if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) {
            const kbps = channel.bitrate ? Math.round(channel.bitrate / 1000) : 0;
            lines.push(`> **Bitrate:** \`${kbps || "?"} kbps\``);
            lines.push(`> **Limite d'utilisateurs:** \`${channel.userLimit || "Aucune"}\``);
        }

        lines.push(`> **Date de création:** <t:${Math.round(channel.createdTimestamp / 1000)}:f> (<t:${Math.round(channel.createdTimestamp / 1000)}:R>)`);

        const embed = new EmbedBuilder()
            .setColor(db.color)
            .setTitle(`Informations de ${channel.name}`)
            .setDescription(lines.join('\n'));

        message.channel.send({ embeds: [embed] });
    },
};

function channelTypeLabel(channelType) {
    switch (channelType) {
        case ChannelType.GuildText: return "Salon textuel";
        case ChannelType.GuildVoice: return "Salon vocal";
        case ChannelType.GuildCategory: return "Catégorie";
        case ChannelType.GuildAnnouncement: return "Salon d'annonces";
        case ChannelType.PublicThread: return "Fil public";
        case ChannelType.PrivateThread: return "Fil privé";
        case ChannelType.GuildStageVoice: return "Salon de conférence";
        case ChannelType.GuildForum: return "Forum";
        case ChannelType.GuildMedia: return "Salon média";
        default: return "Salon";
    }
}

function formatRateLimit(seconds) {
    if (seconds === 0) return "Aucun";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}j`;
}
