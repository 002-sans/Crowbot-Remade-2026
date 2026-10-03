const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiRoleDelete",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antirole");
        if (!conf.etat || !auditLogEntry.target) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "supprimé un rôle");
        const role = auditLogEntry.target;
        guild.roles.create({
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            permissions: role.permissions,
            mentionable: role.mentionable,
            reason: "Anti Role",
        }).catch(() => null);
    },
};
