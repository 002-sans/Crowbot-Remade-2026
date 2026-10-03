const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiChannelOverwriteCreate",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antichannel");
        if (!conf.etat || !auditLogEntry.target) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "ajouté des permissions à un salon");
        auditLogEntry.target.permissionOverwrites?.delete(auditLogEntry.extra).catch(() => null);
    },
};
