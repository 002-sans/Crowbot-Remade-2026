async function sendJoinWelcome(member, db, inviter) {
    if (!db.joinsettings?.actif) return;

    const channel = member.guild.channels.cache.get(db.joinsettings.channel);
    const channels = (db.joinsettings.ghostchannels || [])
        .map(id => member.guild.channels.cache.get(id)).filter(Boolean);
    const roles = (db.joinsettings.autorole || [])
        .map(id => member.guild.roles.cache.get(id)).filter(Boolean);

    if (db.joinsettings.dmactif && db.joinsettings.dm)
        member.send(replaceText(db.joinsettings.dm, member, db, inviter)).catch(() => null);

    roles.forEach(role => member.roles.add(role, "Autorole").catch(() => null));
    if (db.joinsettings.ghostping)
        channels.forEach(c => c.send(`${member}`).then(m => m.delete().catch(() => null)).catch(() => null));
    if (channel && db.joinsettings.message)
        channel.send({ content: replaceText(db.joinsettings.message, member, db, inviter) }).catch(() => null);
}

function replaceText(text, member, db, inviter, custom = false) {
    return text
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
        .replaceAll('{inviteCount}', `${custom ? '.' : db.inviter.find(c => c.id === inviter?.id)?.joins ?? 1}`);
}

module.exports = { sendJoinWelcome };
