const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiWebhookCreate",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        const conf = getModule(db, "antiwebhook");
        if (!conf.etat) return;
        if (isWhitelisted?.() && !conf.max) return;
        client.punish(db, conf.punish, member, "créé un webhook");
        const webhook = auditLogEntry.target;
        if (webhook?.delete) webhook.delete("Anti Webhook").catch(() => null);
    },
};
