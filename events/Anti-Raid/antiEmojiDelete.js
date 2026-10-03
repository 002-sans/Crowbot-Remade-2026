const { getModule } = require("../../utiles/antiraid");
module.exports = {
    name: "antiEmojiDelete",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antiemote");
        if (!conf.etat || !auditLogEntry.target) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "supprimé un émoji");
        const emoji = auditLogEntry.target;
        guild.emojis.create({ attachment: emoji.url || `https://cdn.discordapp.com/emojis/${emoji.id}.png`, name: emoji.name }).catch(() => null);
    },
};
