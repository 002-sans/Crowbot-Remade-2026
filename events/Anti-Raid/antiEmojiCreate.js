const { getModule } = require("../../utiles/antiraid");
module.exports = {
    name: "antiEmojiCreate",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antiemote");
        if (!conf.etat || !auditLogEntry.target) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "créé un émoji");
        auditLogEntry.target.delete?.("Anti Emote").catch(() => null);
    },
};
