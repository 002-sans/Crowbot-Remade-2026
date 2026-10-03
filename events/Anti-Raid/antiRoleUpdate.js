const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiRoleUpdate",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antirole");
        if (!conf.etat || !auditLogEntry.target) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "modifié un rôle");
        const edits = {};
        for (const change of auditLogEntry.changes || []) {
            if (change.key === "name") edits.name = change.old;
            if (change.key === "color") edits.color = change.old;
            if (change.key === "hoist") edits.hoist = change.old;
            if (change.key === "mentionable") edits.mentionable = change.old;
            if (change.key === "permissions") edits.permissions = change.old;
        }
        if (Object.keys(edits).length) auditLogEntry.target.edit(edits).catch(() => null);
    },
};
