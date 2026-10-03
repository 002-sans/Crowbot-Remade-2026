function isExemptUser(client, guild, userId) {
    if (!userId) return true;
    return (
        userId === client.user.id ||
        userId === guild.ownerId ||
        client.isBuyer?.(userId) ||
        userId === client.config.buyer ||
        (client.config.owners || []).includes(userId)
    );
}

function getModule(db, key) {
    return db?.antiraid?.[key] || {};
}

function isWhitelisted(db, member, moduleKey) {
    if (!db || !member) return false;
    if ((db.whitelist || []).includes(member.id)) return true;

    const mod = getModule(db, moduleKey);
    if (mod.max) return false;

    return member.roles.cache.some(r => (db.antiraid?.roles || []).includes(r.id));
}

function shouldIgnore(db, member, moduleKey, isWhitelistedFn) {
    const mod = getModule(db, moduleKey);
    if (!mod.etat) return true;
    if (typeof isWhitelistedFn === 'function') {
        if (isWhitelistedFn() && !mod.max) return true;
        return false;
    }
    return isWhitelisted(db, member, moduleKey) && !mod.max;
}

function punishMode(db, moduleKey) {
    const mod = getModule(db, moduleKey);
    return mod.punish || db?.antiraid?.punish || 'derank';
}

const DANGEROUS = [
    'Administrator',
    'BanMembers',
    'KickMembers',
    'ManageGuild',
    'ManageRoles',
    'ManageChannels',
    'ManageWebhooks',
    'MentionEveryone',
];

function roleIsDangerous(role) {
    if (!role?.permissions) return false;
    return DANGEROUS.some(p => role.permissions.has(p));
}

module.exports = {
    isExemptUser,
    getModule,
    isWhitelisted,
    shouldIgnore,
    punishMode,
    roleIsDangerous,
    DANGEROUS,
};
