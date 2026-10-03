const { getModule } = require("../../utiles/antiraid");
const counters = {};
const resetTimers = {};

module.exports = {
    name: "antiMove",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antimove");
        if (!conf.etat || !auditLogEntry?.executorId) return;
        if (isWhitelisted?.() && !conf.max) return;

        const key = `${guild.id}:${auditLogEntry.executorId}`;
        counters[key] = (counters[key] ?? 0) + 1;

        if (!resetTimers[key]) {
            resetTimers[key] = true;
            setTimeout(() => {
                delete resetTimers[key];
                delete counters[key];
            }, conf.durée || 10000);
        }

        if (counters[key] >= Number(conf.nombre || 5)) {
            delete counters[key];
            client.punish(db, conf.punish, member, "déplacé trop de membres");
        }
    },
};
