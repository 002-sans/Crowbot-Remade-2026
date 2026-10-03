const counters = {};
const resetTimers = {};
const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiDeco",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antideco");
        if (!conf.etat || !auditLogEntry?.executorId) return;
        if (isWhitelisted?.() && !conf.max) return;

        const key = `${guild.id}:${auditLogEntry.executorId}`;
        const amount = Number(auditLogEntry.extra?.count) || 1;
        counters[key] = (counters[key] ?? 0) + amount;

        if (!resetTimers[key]) {
            resetTimers[key] = true;
            setTimeout(() => {
                delete resetTimers[key];
                delete counters[key];
            }, conf.durée || 10000);
        }

        if (counters[key] >= Number(conf.nombre || 5)) {
            delete counters[key];
            client.punish(db, conf.punish, member, "déconnecté trop de membres");
        }
    },
};
