const { getModule, roleIsDangerous } = require("../../utiles/antiraid");

module.exports = {
    name: "antiMemberUpdate",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antirank");
        const blrank = db.blrank || {};
        if (!conf.etat && !blrank.etat) return;

        const wl = isWhitelisted?.();
        if (wl && !conf.max && !blrank.max) return;

        const added = auditLogEntry.changes?.find(c => c.key === "$add")?.new;
        const removed = auditLogEntry.changes?.find(c => c.key === "$remove")?.new;

        let dangerousAdds = [];
        if (blrank.etat && Array.isArray(added)) {
            dangerousAdds = blrank.type === "all"
                ? added
                : added.filter(r => {
                    const role = guild.roles.cache.get(r.id);
                    return role && roleIsDangerous(role);
                });
        }

        if (!conf.etat && blrank.etat && !dangerousAdds.length) return;

        const punish = conf.punish || blrank.punish;
        client.punish(db, punish, member, "donné ou retiré un rôle");

        const target = guild.members.cache.get(auditLogEntry.targetId)
            || await guild.members.fetch(auditLogEntry.targetId).catch(() => null);
        if (!target) return;

        if (conf.etat) {
            if (Array.isArray(added)) target.roles.remove(added.map(r => r.id)).catch(() => null);
            if (Array.isArray(removed)) target.roles.add(removed.map(r => r.id)).catch(() => null);
        } else if (dangerousAdds.length) {
            target.roles.remove(dangerousAdds.map(r => r.id)).catch(() => null);
        }
    },
};
