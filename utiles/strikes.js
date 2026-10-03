function parseDuration(value) {
    const match = String(value || '').match(/^(\d+)\s*([smhdwy])$/i);
    if (!match) return null;
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000, y: 31536000000 };
    return Number(match[1]) * multipliers[match[2].toLowerCase()];
}

async function addStrike(client, member, trigger) {
    if (!member?.guild) return;
    const db = client.get(member.guild.id);
    const normalized = ({ antispam: 'spam', antilink: 'link', antimassmention: 'massmention', spam: 'spam', link: 'link', massmention: 'massmention', badwords: 'badwords' })[trigger];
    if (!normalized) return;

    db.memberstrikes ??= {};
    db.memberstrikes[member.id] ??= [];
    const now = Date.now();
    const entries = db.memberstrikes[member.id].filter(strike => now - strike.time <= 24 * 60 * 60 * 1000);
    entries.push({ trigger: normalized, time: now });
    db.memberstrikes[member.id] = entries;

    const type = member.joinedTimestamp && now - member.joinedTimestamp >= Number(db.ancien || 3600000) ? 'ancien' : 'nouveau';
    const threshold = Number(db.strikes?.[type]?.[normalized] ?? db.strikes?.[type]?.[trigger] ?? 1);
    const matching = entries.filter(strike => strike.trigger === normalized);
    const rule = (db.strikepunish || [])
        .filter(p => Number(p.strikes) <= matching.length && parseDuration(p.window) && matching.filter(s => now - s.time <= parseDuration(p.window)).length >= Number(p.strikes))
        .sort((a, b) => Number(b.strikes) - Number(a.strikes))[0];

    if (matching.length >= threshold) {
        if (rule) await executePunishment(member, rule, db).catch(() => null);
        db.memberstrikes[member.id] = entries.filter(strike => strike.trigger !== normalized);
    }
    client.save(member.guild.id);
}

async function executePunishment(member, rule, db) {
    const sanction = String(rule.sanction || '').toLowerCase();
    const duration = parseDuration(rule.duration);
    if (sanction === 'mute' || sanction === 'tempmute') {
        return member.timeout(duration || 28 * 86400000, 'Strike');
    }
    if (sanction === 'kick') return member.kick('Strike');
    if (sanction === 'ban' || sanction === 'tempban') {
        await member.guild.members.ban(member.id, { reason: 'Strike' });
        // Le déban repasse par db.tempban : un setTimeout serait perdu au redémarrage.
        if (sanction === 'tempban' && duration && db) {
            db.tempban = (db.tempban || []).filter(entry => entry.userId !== member.id);
            db.tempban.push({ date: Date.now() + duration, userId: member.id });
        }
        return;
    }
    if (sanction === 'derank') {
        const keep = new Set(member.guild.roles.everyone ? [member.guild.roles.everyone.id] : []);
        for (const id of member.guild.client?.get?.(member.guild.id)?.antiraid?.noderank || []) keep.add(id);
        return member.roles.set(member.roles.cache.filter(role => keep.has(role.id)).map(role => role.id), 'Strike');
    }
}

module.exports = { addStrike, parseDuration };
