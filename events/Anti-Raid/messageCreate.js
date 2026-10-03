const { PermissionFlagsBits } = require("discord.js");
const { isExemptUser, isWhitelisted, getModule } = require("../../utiles/antiraid");
const { addStrike } = require("../../utiles/strikes");

const inviteRegex = /(discord\.gg|discord\.com\/invite|discordapp\.com\/invite)/i;
const anyLinkRegex = /https?:\/\/[^\s]+/i;

module.exports = {
    name: "messageCreate",
    async execute(client, message) {
        if (!message.guild || !message.member || message.author.bot) return;
        const db = client.get(message.guildId);
        if (isExemptUser(client, message.guild, message.author.id)) return;

        const mass = getModule(db, "antimassmention");
        if (mass.etat && message.mentions.users.size >= Number(mass.nombre || 4)) {
            if (!(isWhitelisted(db, message.member, "antimassmention") && !mass.max)) {
                addStrike(client, message.member, 'massmention').catch(() => null);
                client.punish(db, mass.punish, message.member, "Mass mention");
                message.delete().catch(() => null);
            }
        }

        if (/@everyone|@here/.test(message.content)) {
            const conf = getModule(db, "antieveryone");
            if (conf.etat) {
                if (message.webhookId) {
                    const cloned = await message.channel.clone({
                        name: message.channel.name,
                        type: message.channel.type,
                        topic: message.channel.topic ?? undefined,
                        nsfw: message.channel.nsfw,
                        bitrate: message.channel.bitrate ?? undefined,
                        userLimit: message.channel.userLimit ?? undefined,
                        rateLimitPerUser: message.channel.rateLimitPerUser ?? undefined,
                        parent: message.channel.parentId ?? undefined,
                        permissionOverwrites: message.channel.permissionOverwrites.cache,
                        position: message.channel.rawPosition,
                        reason: "Anti Everyone",
                    }).catch(() => null);
                    return message.channel.delete().catch(() => cloned?.delete?.().catch(() => null));
                }

                if (message.member.permissions.has(PermissionFlagsBits.MentionEveryone)
                    && !(isWhitelisted(db, message.member, "antieveryone") && !conf.max)) {
                    client.punish(db, conf.punish, message.member, "ping everyone/here");
                    if (conf.type === "delete") message.delete().catch(() => null);
                    else {
                        const cloned = await message.channel.clone({
                            name: message.channel.name,
                            type: message.channel.type,
                            topic: message.channel.topic ?? undefined,
                            nsfw: message.channel.nsfw,
                            parent: message.channel.parentId ?? undefined,
                            permissionOverwrites: message.channel.permissionOverwrites.cache,
                            position: message.channel.rawPosition,
                            reason: "Anti Everyone",
                        }).catch(() => null);
                        return message.channel.delete().catch(() => cloned?.delete?.().catch(() => null));
                    }
                }
            }
        }

        const link = getModule(db, "antilink");
        if (link.etat && !(isWhitelisted(db, message.member, "antilink") && !link.max)) {
            const type = link.type || "all";
            const hit =
                (type === "all" && anyLinkRegex.test(message.content)) ||
                (type === "invite" && inviteRegex.test(message.content)) ||
                (type === "discord" && inviteRegex.test(message.content)) ||
                (type === "lien" && anyLinkRegex.test(message.content));

            if (hit) {
                addStrike(client, message.member, 'link').catch(() => null);
                client.punish(db, link.punish, message.member, "envoyé un lien");
                message.delete().catch(() => null);
            }
        }
    },
};
