const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiUnban",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antiunban");
        if (!conf.etat) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "débanni un membre");
        if (auditLogEntry.target) guild.bans.create(auditLogEntry.target, { reason: "Anti Unban" }).catch(() => null);
    },
};
