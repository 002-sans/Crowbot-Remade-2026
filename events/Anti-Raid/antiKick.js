const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiKick",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antikick");
        if (!conf.etat) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "expulsé un membre");
    },
};
