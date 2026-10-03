const { ChannelType } = require("discord.js");
const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiChannelCreate",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antichannel");
        if (!conf.etat || !auditLogEntry?.target) return;
        if (isWhitelisted?.() && !conf.max) return;

        client.punish(db, conf.punish, member, "crée un salon");
        auditLogEntry.target.delete("Anti Channel").catch(() => null);

        try {
            const { target, targetId } = auditLogEntry;
            if (target.type === ChannelType.GuildCategory) {
                client.cachedChannel.delete(targetId);
            } else if (target.parentId) {
                const siblings = client.cachedChannel.get(target.parentId) || [];
                const idx = siblings.findIndex(c => (c.id || c) === targetId);
                if (idx !== -1) siblings.splice(idx, 1);
                client.cachedChannel.set(target.parentId, siblings);
                client.cachedCategory.delete(targetId);
            }
            client.cachedPositions.delete(targetId);
            client.cachedPermissions.delete(targetId);
        } catch (_) {}
    },
};
