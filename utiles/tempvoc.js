function getTempVocContext(message, db) {
    const channel = message.member?.voice?.channel;
    const tracked = channel && db.tempvocChannels?.[channel.id];
    if (!channel || !tracked) return null;

    const config = db.chtempvoc?.find(entry => entry.id === tracked.sourceId);
    return config ? { channel, config, tracked } : null;
}

function useTempVocAction(db, channelId) {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    db.tempvocActions ??= {};
    const recent = (db.tempvocActions[channelId] || []).filter(timestamp => now - timestamp < windowMs);

    if (recent.length >= 2) {
        return { allowed: false, remaining: Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 60000)) };
    }

    recent.push(now);
    db.tempvocActions[channelId] = recent;
    return { allowed: true };
}

function limitMessage(db, remaining) {
    return `Vous devez attendre ${remaining}m avant de pouvoir modifier ce salon`;
}

module.exports = { getTempVocContext, useTempVocAction, limitMessage };
