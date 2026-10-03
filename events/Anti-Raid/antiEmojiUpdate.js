const { getModule } = require("../../utiles/antiraid");
module.exports = {
    name: "antiEmojiUpdate",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antiemote");
        if (!conf.etat || !auditLogEntry.target) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "modifié un émoji");
        const oldName = auditLogEntry.changes?.find(c => c.key === "name")?.old;
        if (oldName) auditLogEntry.target.edit({ name: oldName }).catch(() => null);
    },
};
