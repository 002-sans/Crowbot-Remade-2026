const { EmbedBuilder } = require("discord.js");

function sendModLog(client, guild, type, title, description, color = 0x5865F2) {
    const db = client.get(guild.id);
    if (!db.logs?.moderation || db.logs.mods?.[type] === false) return;
    const channel = guild.channels.cache.get(db.logs.moderation);
    if (!channel) return;
    return channel.send({ embeds: [new EmbedBuilder()
        .setTitle(title || type)
        .setDescription(description || "Aucune description")
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: db.footer ?? "ζ͜͡Crow Bots" })] }).catch(() => null);
}

module.exports = { sendModLog };
