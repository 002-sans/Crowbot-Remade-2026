module.exports = {
    name: "guildMemberDelete",
    async execute(client, data) {
        const { guildId, member, inviter } = data;
        const db = client.get(guildId);

        if (inviter) {
            const inviterDb = db.inviter.find(i => i.id === inviter.id);
            if (inviterDb) {
                inviterDb.leaves++;
                inviterDb.joiners = inviterDb.joiners.filter(id => id !== member.id);
            }
        }

        client.save(guildId);

        if (db.leavesettings?.actif) {
            const channel = member.guild.channels.cache.get(db.leavesettings.channel);

            if (db.leavesettings.dmactif && db.leavesettings.dm) {
                member.send(replaceText(db.leavesettings.dm, member, db, inviter)).catch(() => null);
            }

            if (channel && db.leavesettings.message) {
                channel.send({ content: replaceText(db.leavesettings.message, member, db, inviter) })
                    .then(sent => {
                        const delay = Number(db.leavesettings.delete) || 0;
                        if (delay > 0) setTimeout(() => sent.delete().catch(() => null), delay);
                    })
                    .catch(() => null);
            }
        }
    }
}

function replaceText(text, member, db, inviter, custom = false) {
    if (!text) return false;
    
    const text2 = text
        .replaceAll('{memberMention}', member)
        .replaceAll('{MemberName}', member.user.username)
        .replaceAll('{MemberFullName}', member.user.username)
        .replaceAll('{MemberDisplayName}', member.user.globalName || member.user.username)
        .replaceAll('{MemberJoinedAt}', `<t:${Math.round(member.joinedTimestamp / 1000)}:d>`)
        .replaceAll('{MemberCreatedAt}', `<t:${Math.round(member.user.createdTimestamp / 1000)}:d>`)
        .replaceAll('{MemberID}', member.id)
        .replaceAll('{MemberPic}', member.user.displayAvatarURL())
        .replaceAll('{ServerBoostsCount}', member.guild.premiumSubscriptionCount)
        .replaceAll('{ServerLevel}', member.guild.premiumTier || "0")
        .replaceAll('{ServerMembersCount}', member.guild.memberCount)
        .replaceAll('{VocalMembersCount}', member.guild.members.cache.filter(m => m.voice.channel).size)
        .replaceAll('{OnlineMembersCount}', member.guild.members.cache.filter(m => m.presence?.status !== "offline").size)
        .replaceAll('{OfflineMembersCount}', member.guild.members.cache.filter(m => m.presence?.status === "offline").size)
        .replaceAll('{ServerRolesCount}', member.guild.roles.cache.size)
        .replaceAll('{ServerChannelsCount}', member.guild.channels.cache.size)
        .replaceAll('{InviterMention}', `${custom ? custom : inviter?.id ? `<@${inviter.id}>` : 'Inconnu'}`)
        .replaceAll('{inviterName}', `${custom ? custom : inviter?.username ?? 'Inconnu'}`)
        .replaceAll('{inviteCount}', `${custom ? '.' : db.inviter.find(c => c.id === inviter?.id)?.joins ?? 1}`)
    
    return text2
    }
    