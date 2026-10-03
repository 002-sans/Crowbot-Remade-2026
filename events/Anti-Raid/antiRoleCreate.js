const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiRoleCreate",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antirole");
        if (!conf.etat || !auditLogEntry.target) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "créé un rôle");
        auditLogEntry.target.delete("Anti Role").catch(() => null);
    },
};
