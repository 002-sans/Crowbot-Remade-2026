const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiGuildUpdate",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antiupdate");
        if (!conf.etat) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "modifié le serveur");
        const getOld = key => auditLogEntry.changes?.find(k => k.key === key)?.old;
        guild.edit({
            name: getOld("name") ?? guild.name,
            verificationLevel: getOld("verification_level") ?? guild.verificationLevel,
            defaultMessageNotifications: getOld("default_message_notifications") ?? guild.defaultMessageNotifications,
            explicitContentFilter: getOld("explicit_content_filter") ?? guild.explicitContentFilter,
            afkTimeout: getOld("afk_timeout") ?? guild.afkTimeout,
            preferredLocale: getOld("preferred_locale") ?? guild.preferredLocale,
        }).catch(() => null);
    },
};
