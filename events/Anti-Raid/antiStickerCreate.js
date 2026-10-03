const { getModule } = require("../../utiles/antiraid");
module.exports = {
    name: "antiStickerCreate",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antisticker");
        if (!conf.etat || !auditLogEntry.target) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "créé un sticker");
        auditLogEntry.target.delete?.("Anti Sticker").catch(() => null);
    },
};
