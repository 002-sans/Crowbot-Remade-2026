const banned = {};
const interval = {};
const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiBanAdd",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antiban");
        if (!conf.etat) return;
        if (isWhitelisted?.() && !conf.max) return;

        const { executorId, target } = auditLogEntry;
        if (!executorId || !target) return;

        banned[executorId] = (banned[executorId] ?? 0) + 1;

        if (banned[executorId] >= Number(conf.nombre || 1) && !interval[executorId]) {
            interval[executorId] = true;
            setTimeout(() => {
                delete interval[executorId];
                delete banned[executorId];
            }, conf.durée || 10000);
            client.punish(db, conf.punish, member, "banni trop de membres");
        }

        guild.bans.remove(target).catch(() => null);
    },
};
