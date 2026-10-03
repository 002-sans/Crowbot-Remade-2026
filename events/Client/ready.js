const cron = require('node-cron');
const { Client, Guild, ChannelType, ActivityType } = require('discord.js');

module.exports = {
    name: "clientReady",
    once: true,
    /**
     * @param {Client} client
    */
    async execute(client) {
        console.log(`[+] ${client.user.username} (${client.user.id}) est prêt | ${client.guilds.cache.size.toLocaleString('fr-FR')} serveurs | ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toLocaleString('fr-FR')} utilisateurs`);

        for (const g of client.guilds.cache.values()) {
            g.channels.cache.filter(channel => channel.type === ChannelType.GuildCategory).forEach(categoryChannel => {
                client.cachedPositions.set(categoryChannel.id, categoryChannel.position);
                client.cachedChannel.set(categoryChannel.id, categoryChannel.children.cache.map(child => ({
                    id: child.id,
                    name: child.name,
                    type: child.type,
                    topic: child.topic || null,
                    nsfw: child.nsfw || false,
                    bitrate: child.bitrate || null,
                    userLimit: child.userLimit || null,
                    rateLimitPerUser: child.rateLimitPerUser || null,
                    position: child.position,
                    permissionOverwrites: child.permissionOverwrites?.cache.map(o => ({
                        id: o.id,
                        allow: o.allow.bitfield.toString(),
                        deny: o.deny.bitfield.toString(),
                        type: o.type
                    })) || []
                })));
            });

            g.channels.cache.filter(c => c.type !== ChannelType.GuildCategory).forEach(otherChannel => {
                client.cachedPositions.set(otherChannel.id, otherChannel.position);
                client.cachedCategory.set(otherChannel.id, otherChannel.parentId ?? null);
                client.cachedPermissions.set(otherChannel.id, otherChannel.permissionOverwrites?.cache.map(o => ({
                    id: o.id,
                    allow: o.allow.bitfield.toString(),
                    deny: o.deny.bitfield.toString(),
                    type: o.type
                })) || []);
            });

            // client.get() complète déjà les clés manquantes avec serveurs/example.json.
            const db = client.get(g.id);
            let changed = false;

            try {
                const guildInvites = await g.invites.fetch();
                guildInvites.forEach(i => {
                    db.invites[i.code] = {
                        inviterId: i.inviterId,
                        uses: i.uses,
                        inviter: db.invites[i.code]?.inviter ?? []
                    };
                });
                changed = true;
            } catch {}

            if (changed) client.save(g.id);
        }

        cron.schedule('*/5 * * * *', async () => {
            for (const g of client.guilds.cache.values()) {
                const db = client.get(g.id);
                let changed = false;

                for (const data of db.tempban.filter(c => c.date <= Date.now())) {
                    g.bans.remove(data.userId).catch(() => null);
                    db.tempban = db.tempban.filter(c => c.userId !== data.userId);
                    changed = true;
                }

                for (const data of [...db.tempcmute.filter(c => c.date <= Date.now())]) {
                    const channel = await client.channels.fetch(data.channelId).catch(() => null);
                    if (channel) channel.permissionOverwrites.edit(data.memberId, { SendMessages: null, Connect: null });
                    db.tempcmute = db.tempcmute.filter(c => c.date !== data.date || c.channelId !== data.channelId);
                    changed = true;
                }

                for (const data of db.counters.filter(o => o.guildId == g.id)) {
                    const channel = g.channels.cache.get(data.id);
                    if (channel) channel.setName(replaceText(data.name, g)).catch(() => null);
                }

                if (db.temproles?.length) {
                    for (const data of [...db.temproles.filter(t => t.date <= Date.now())]) {
                        const member = await g.members.fetch(data.memberId).catch(() => null);
                        if (member) member.roles.remove(data.roleId).catch(() => null);
                        db.temproles = db.temproles.filter(t => !(t.memberId === data.memberId && t.roleId === data.roleId && t.date === data.date));
                        changed = true;
                    }
                }

                if (db.reminders?.length) {
                    for (const data of [...db.reminders.filter(r => r.date <= Date.now())]) {
                        const channel = g.channels.cache.get(data.channelId);
                        if (channel) channel.send(data.content).catch(() => null);
                        db.reminders = db.reminders.filter(r => r !== data);
                        changed = true;
                    }
                }

                if (db.showpics?.actif && db.showpics.channel) {
                    const channel = g.channels.cache.get(db.showpics.channel);
                    const members = g.members.cache.filter(m => !m.user.bot && m.user.displayAvatarURL());
                    if (channel && members.size) {
                        const member = members.random();
                        channel.send({ files: [member.user.displayAvatarURL({ size: 1024 })] }).catch(() => null);
                    }
                }

                if (changed) client.save(g.id);
            }
        });

        if (client.config.presence.name && client.config.presence.type) {
            client.user.setActivity({ name: client.config.presence.name, type: client.config.presence.type, url: client.config.presence.url })
        }
    }
}


/**
 * @param {string[]} text
 * @param {Guild} guild
*/

function replaceText(text, guild) {
    if (!text) return false;

    let text2 = text
        .replaceAll('{memberCount}', guild.memberCount)
        .replaceAll('{humainCount}', guild.members.cache.filter(m => !m.user.bot).size)
        .replaceAll('{botCount}', guild.members.cache.filter(m => m.user.bot).size)
        .replaceAll('{channelCount}', guild.channels.cache.size)
        .replaceAll('{textCount}', guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size)
        .replaceAll('{voiceCount}', guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size)
        .replaceAll('{roleCount}', guild.roles.cache.size)
        .replaceAll('{emoteCount}', guild.emojis.cache.size)
        .replaceAll('{stickerCount}', guild.stickers.cache.size)
        .replaceAll('{onlineCount}', guild.members.cache.filter(m => m.presence && m.presence.status !== "invisible" && m.presence.status !== "offline").size)
        .replaceAll('{offlineCount}', guild.members.cache.filter(m => !m.presence || m.presence.status === "invisible" || m.presence.status === "offline").size)
        .replaceAll('{dndCount}', guild.members.cache.filter(m => (m.presence ?? {}).status === "dnd").size)
        .replaceAll('{idleCount}', guild.members.cache.filter(m => (m.presence ?? {}).status === "idle").size)
        .replaceAll('{streamCount}', guild.members.cache.filter(m => m.presence?.activities?.some(a => a.type === ActivityType.Streaming)).size)
        .replaceAll('{vocCount}', guild.members.cache.filter(m => m.voice.channel).size)
        .replaceAll('{muteCount}', guild.members.cache.filter(m => m.voice.mute).size)
        .replaceAll('{deafCount}', guild.members.cache.filter(m => m.voice.deaf).size)
        .replaceAll('{webcamCount}', guild.members.cache.filter(m => m.voice.selfVideo).size)
        .replaceAll('{streamingCount}', guild.members.cache.filter(m => m.voice.streaming).size);

    guild.roles.cache.forEach(role => {
        text2 = text2.replaceAll(`{hasRole/${role.id}}`, guild.members.cache.filter(m => m.roles.cache.has(role.id)).size);
        text2 = text2.replaceAll(`{noRole/${role.id}}`, guild.members.cache.filter(m => !m.roles.cache.has(role.id)).size);
    });
    return text2;
}
