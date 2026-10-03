const { getModule } = require("../../utiles/antiraid");
module.exports = {
    name: "antiStickerUpdate",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antisticker");
        if (!conf.etat || !auditLogEntry.target) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "modifié un sticker");
        const oldName = auditLogEntry.changes?.find(c => c.key === "name")?.old;
        if (oldName) auditLogEntry.target.edit({ name: oldName }).catch(() => null);
    },
};
