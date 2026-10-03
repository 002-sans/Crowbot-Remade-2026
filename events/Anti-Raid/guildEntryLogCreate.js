const { AuditLogEvent } = require("discord.js");
const { isExemptUser, isWhitelisted } = require("../../utiles/antiraid");

const MODULE_BY_ACTION = {
    [AuditLogEvent.ChannelCreate]: "antichannel",
    [AuditLogEvent.ChannelDelete]: "antichannel",
    [AuditLogEvent.ChannelUpdate]: "antichannel",
    [AuditLogEvent.ChannelOverwriteCreate]: "antichannel",
    [AuditLogEvent.ChannelOverwriteDelete]: "antichannel",
    [AuditLogEvent.ChannelOverwriteUpdate]: "antichannel",
    [AuditLogEvent.RoleCreate]: "antirole",
    [AuditLogEvent.RoleDelete]: "antirole",
    [AuditLogEvent.RoleUpdate]: "antirole",
    [AuditLogEvent.BotAdd]: "antibot",
    [AuditLogEvent.MemberBanAdd]: "antiban",
    [AuditLogEvent.MemberBanRemove]: "antiunban",
    [AuditLogEvent.MemberKick]: "antikick",
    [AuditLogEvent.WebhookCreate]: "antiwebhook",
    [AuditLogEvent.GuildUpdate]: "antiupdate",
    [AuditLogEvent.EmojiCreate]: "antiemote",
    [AuditLogEvent.EmojiDelete]: "antiemote",
    [AuditLogEvent.EmojiUpdate]: "antiemote",
    [AuditLogEvent.StickerCreate]: "antisticker",
    [AuditLogEvent.StickerDelete]: "antisticker",
    [AuditLogEvent.StickerUpdate]: "antisticker",
    [AuditLogEvent.MemberRoleUpdate]: "antirank",
    [AuditLogEvent.MemberMove]: "antimove",
    [AuditLogEvent.MemberDisconnect]: "antideco",
};

const EVENT_BY_ACTION = {
    [AuditLogEvent.ChannelCreate]: "antiChannelCreate",
    [AuditLogEvent.ChannelDelete]: "antiChannelDelete",
    [AuditLogEvent.ChannelUpdate]: "antiChannelUpdate",
    [AuditLogEvent.ChannelOverwriteCreate]: "antiChannelOverwriteCreate",
    [AuditLogEvent.ChannelOverwriteDelete]: "antiChannelOverwriteDelete",
    [AuditLogEvent.ChannelOverwriteUpdate]: "antiChannelOverwriteUpdate",
    [AuditLogEvent.RoleCreate]: "antiRoleCreate",
    [AuditLogEvent.RoleDelete]: "antiRoleDelete",
    [AuditLogEvent.RoleUpdate]: "antiRoleUpdate",
    [AuditLogEvent.BotAdd]: "antiBotAdd",
    [AuditLogEvent.MemberBanAdd]: "antiBanAdd",
    [AuditLogEvent.MemberBanRemove]: "antiUnban",
    [AuditLogEvent.MemberKick]: "antiKick",
    [AuditLogEvent.WebhookCreate]: "antiWebhookCreate",
    [AuditLogEvent.GuildUpdate]: "antiGuildUpdate",
    [AuditLogEvent.EmojiCreate]: "antiEmojiCreate",
    [AuditLogEvent.EmojiDelete]: "antiEmojiDelete",
    [AuditLogEvent.EmojiUpdate]: "antiEmojiUpdate",
    [AuditLogEvent.StickerCreate]: "antiStickerCreate",
    [AuditLogEvent.StickerDelete]: "antiStickerDelete",
    [AuditLogEvent.StickerUpdate]: "antiStickerUpdate",
    [AuditLogEvent.MemberRoleUpdate]: "antiMemberUpdate",
    [AuditLogEvent.MemberMove]: "antiMove",
    [AuditLogEvent.MemberDisconnect]: "antiDeco",
};

module.exports = {
    name: "guildAuditLogEntryCreate",
    async execute(client, auditLogEntry, guild) {
        if (!auditLogEntry || !guild) return;

        const db = client.get(guild.id);

        if (isExemptUser(client, guild, auditLogEntry.executorId)) {
            return client.emit("trustedChannelAction", auditLogEntry, guild);
        }

        const eventName = EVENT_BY_ACTION[auditLogEntry.action];
        if (!eventName) return;

        const member = guild.members.cache.get(auditLogEntry.executorId)
            || await guild.members.fetch(auditLogEntry.executorId).catch(() => null);
        if (!member) return;

        const moduleKey = MODULE_BY_ACTION[auditLogEntry.action];
        let cached;
        const checkWL = () => {
            if (cached === undefined) cached = isWhitelisted(db, member, moduleKey);
            return cached;
        };

        client.emit(eventName, auditLogEntry, guild, member, db, checkWL);
    },
};
