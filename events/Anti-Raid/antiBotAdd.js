const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiBotAdd",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antibot");
        if (!conf.etat) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "ajoute un bot");
        auditLogEntry.target?.kick?.("Anti Bot").catch(() => null);
    },
};
