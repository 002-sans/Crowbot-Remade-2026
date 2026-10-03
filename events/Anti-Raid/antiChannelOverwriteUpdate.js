const { PermissionsBitField } = require("discord.js");
const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiChannelOverwriteUpdate",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antichannel");
        if (!conf.etat || !auditLogEntry.target) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "modifié les permissions d'un salon");

        const previousAllow = BigInt(auditLogEntry.changes?.find(c => c.key === "allow")?.old || 0);
        const previousDeny = BigInt(auditLogEntry.changes?.find(c => c.key === "deny")?.old || 0);
        const submittedPerms = {};
        for (const [perm, value] of Object.entries(PermissionsBitField.Flags)) {
            const bit = BigInt(value);
            if ((previousAllow & bit) === bit) submittedPerms[perm] = true;
            else if ((previousDeny & bit) === bit) submittedPerms[perm] = false;
            else submittedPerms[perm] = null;
        }
        auditLogEntry.target.permissionOverwrites?.edit(auditLogEntry.extra, submittedPerms).catch(() => null);
    },
};
