const { getModule } = require("../../utiles/antiraid");
module.exports = {
    name: "antiStickerDelete",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antisticker");
        if (!conf.etat) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "supprimé un sticker");
    },
};
