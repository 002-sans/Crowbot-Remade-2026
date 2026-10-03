
const { Client, Presence, ActivityType, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "presenceUpdate",
    /**
     * @param {Client} client
     * @param {Presence} oldPresence
     * @param {Presence} newPresence
    */
    async execute(client, oldPresence, newPresence) {
        if (!oldPresence?.guild || !newPresence?.guild) return;
        const db = client.get(newPresence.guild.id)

        if (db.soutiens?.twitch){
            const oldActivities = oldPresence?.activities || [];
            const newActivities = newPresence?.activities || [];
        
            const wasNotStreaming = oldActivities.some(activity => activity.type === ActivityType.Streaming);
            const isStreamingNow  = newActivities.some(activity => activity.type === ActivityType.Streaming);
        
            const channel = newPresence.guild.channels.cache.get(db.soutiens.logs)
            const embed = new EmbedBuilder()
                .setColor(db.color)
                .setDescription(`${newPresence.user} (\`${newPresence.user.displayName}\`) est maintenant en streaming`)
        
            if (!wasNotStreaming && isStreamingNow && channel) return channel.send({ embeds: [embed], content: db.soutiens.twitchping.filter(id => newPresence.guild.roles.cache.get(id)).map(id => `<@&${id}>`).join(', ') || null }).catch(() => null)
        }
        if (db.soutiens?.actif) {
            const member = newPresence.member;
            if (!member) return;

            const isBlacklisted = Array.isArray(db.soutiens.blroles) && member.roles.cache.some(r => db.soutiens.blroles.includes(r.id));
            const statusRole = db.soutiens.role ? newPresence.guild.roles.cache.get(db.soutiens.role) : null;
            const tagRole = db.soutiens.tag_role ? newPresence.guild.roles.cache.get(db.soutiens.tag_role) : null;

            // 1. Status Role Check
            if (statusRole) {
                if (isBlacklisted) {
                    if (member.roles.cache.has(statusRole.id)) member.roles.remove(statusRole, "Soutiens retiré (blacklist)").catch(() => null);
                } else {
                    const customActivity = newPresence.activities?.find(a => a.type === ActivityType.Custom);
                    const state = customActivity?.state || "";
                    const texts = Array.isArray(db.soutiens.text) ? db.soutiens.text : [];

                    let matchesStatus = false;
                    if (db.soutiens.only_status) {
                        matchesStatus = texts.includes(state);
                    } else {
                        matchesStatus = texts.some(t => state.includes(t));
                    }

                    if (db.soutiens.accept_invites && !matchesStatus) {
                        const hasDiscordInvite = /(discord\.(gg|io|me|li)\/.+|discord\.com\/invite\/.+)/i.test(state);
                        if (hasDiscordInvite) matchesStatus = true;
                    }

                    if (matchesStatus && texts.length > 0) {
                        if (!member.roles.cache.has(statusRole.id)) member.roles.add(statusRole, "Soutiens ajouté").catch(() => null);
                    } else {
                        if (member.roles.cache.has(statusRole.id)) member.roles.remove(statusRole, "Soutiens retiré").catch(() => null);
                    }
                }
            }

            // 2. Tag Role Check
            if (tagRole) {
                if (isBlacklisted) {
                    if (member.roles.cache.has(tagRole.id)) member.roles.remove(tagRole, "Soutiens tag retiré (blacklist)").catch(() => null);
                } else {
                    const texts = Array.isArray(db.soutiens.text) ? db.soutiens.text : [];
                    const userTag = member.user?.username || "";
                    const displayName = member.displayName || "";
                    const hasTag = texts.some(t => userTag.includes(t) || displayName.includes(t));

                    if (hasTag && texts.length > 0) {
                        if (!member.roles.cache.has(tagRole.id)) member.roles.add(tagRole, "Soutiens tag ajouté").catch(() => null);
                    } else {
                        if (member.roles.cache.has(tagRole.id)) member.roles.remove(tagRole, "Soutiens tag retiré").catch(() => null);
                    }
                }
            }
        }
    }
};
