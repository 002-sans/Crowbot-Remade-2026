/**
 * Universal multi-target resolver for CrowBot
 * Supports separator ",," as well as mentions, IDs, names, and tags.
 */

function cleanInput(str) {
    if (!str) return [];
    if (Array.isArray(str)) {
        str = str.join(' ');
    }
    if (typeof str !== 'string') return [];

    // If string contains ",,", split by ",,"
    if (str.includes(',,')) {
        return str.split(',,').map(s => s.trim()).filter(Boolean);
    }

    // Otherwise split by space or commas
    return str.split(/\s+/).map(s => s.trim()).filter(Boolean);
}

function extractId(input) {
    if (!input) return null;
    if (typeof input !== 'string') return null;
    const match = input.match(/^<@!?(\d+)>$/) || input.match(/^<@&(\d+)>$/) || input.match(/^<#(\d+)>$/) || input.match(/^(\d{17,20})$/);
    return match ? match[1] : input.trim();
}

/**
 * Resolve members from string / mentions / array
 * @param {import('discord.js').Guild} guild
 * @param {string|string[]} input
 * @param {import('discord.js').Collection<string, import('discord.js').GuildMember>} [mentionMembers]
 * @returns {Promise<import('discord.js').GuildMember[]>}
 */
async function resolveMembers(guild, input, mentionMembers = null) {
    if (!guild) return [];
    const members = [];
    const seen = new Set();

    const addMember = (m) => {
        if (m && !seen.has(m.id)) {
            seen.add(m.id);
            members.push(m);
        }
    };

    const parts = cleanInput(input);

    for (const part of parts) {
        const id = extractId(part);
        if (/^\d{17,20}$/.test(id)) {
            const m = guild.members.cache.get(id) || await guild.members.fetch(id).catch(() => null);
            if (m) {
                addMember(m);
                continue;
            }
        }

        // Check by username / displayName / tag
        const lower = part.toLowerCase();
        const found = guild.members.cache.find(m =>
            m.user.username.toLowerCase() === lower ||
            m.displayName.toLowerCase() === lower ||
            m.user.tag?.toLowerCase() === lower
        );
        if (found) {
            addMember(found);
            continue;
        }
    }

    // Add remaining mentions if input had mentions that were not captured
    if (mentionMembers && mentionMembers.size > 0 && members.length === 0) {
        for (const m of mentionMembers.values()) {
            addMember(m);
        }
    }

    return members;
}

/**
 * Resolve roles from string / mentions / array
 * @param {import('discord.js').Guild} guild
 * @param {string|string[]} input
 * @param {import('discord.js').Collection<string, import('discord.js').Role>} [mentionRoles]
 * @returns {Promise<import('discord.js').Role[]>}
 */
async function resolveRoles(guild, input, mentionRoles = null) {
    if (!guild) return [];
    const roles = [];
    const seen = new Set();

    const addRole = (r) => {
        if (r && !seen.has(r.id)) {
            seen.add(r.id);
            roles.push(r);
        }
    };

    const parts = cleanInput(input);

    for (const part of parts) {
        const id = extractId(part);
        if (/^\d{17,20}$/.test(id)) {
            const r = guild.roles.cache.get(id) || await guild.roles.fetch(id).catch(() => null);
            if (r) {
                addRole(r);
                continue;
            }
        }

        // Check by role name
        const lower = part.toLowerCase();
        const found = guild.roles.cache.find(r => r.name.toLowerCase() === lower);
        if (found) {
            addRole(found);
            continue;
        }
    }

    if (mentionRoles && mentionRoles.size > 0 && roles.length === 0) {
        for (const r of mentionRoles.values()) {
            addRole(r);
        }
    }

    return roles;
}

/**
 * Resolve channels from string / mentions / array
 * @param {import('discord.js').Guild} guild
 * @param {string|string[]} input
 * @param {import('discord.js').Collection<string, import('discord.js').GuildBasedChannel>} [mentionChannels]
 * @returns {import('discord.js').GuildBasedChannel[]}
 */
function resolveChannels(guild, input, mentionChannels = null) {
    if (!guild) return [];
    const channels = [];
    const seen = new Set();

    const addChannel = (c) => {
        if (c && !seen.has(c.id)) {
            seen.add(c.id);
            channels.push(c);
        }
    };

    const parts = cleanInput(input);

    for (const part of parts) {
        const id = extractId(part);
        if (/^\d{17,20}$/.test(id)) {
            const c = guild.channels.cache.get(id);
            if (c) {
                addChannel(c);
                continue;
            }
        }

        const lower = part.toLowerCase();
        const found = guild.channels.cache.find(c => c.name.toLowerCase() === lower);
        if (found) {
            addChannel(found);
            continue;
        }
    }

    if (mentionChannels && mentionChannels.size > 0 && channels.length === 0) {
        for (const c of mentionChannels.values()) {
            addChannel(c);
        }
    }

    return channels;
}

/**
 * Split multi-group command arguments by ",," or space.
 * For example: "+addrole user1,,user2 role1,,role2" -> group 1 = "user1,,user2", group 2 = "role1,,role2"
 * @param {string} fullArgsText
 * @param {number} groupCount
 * @returns {string[]}
 */
function splitArgumentGroups(fullArgsText, groupCount = 2) {
    if (!fullArgsText) return [];
    const raw = fullArgsText.trim();
    if (!raw) return [];

    // Split by whitespace where items separated by ,, stay together unless space separates distinct groups
    const parts = raw.split(/\s+/);
    if (groupCount <= 1 || parts.length <= 1) {
        return [raw];
    }

    if (groupCount === 2) {
        return [parts[0], parts.slice(1).join(' ')];
    }

    return parts;
}

/**
 * Collecte les IDs utilisateur depuis du texte + mentions du message.
 * @param {import('discord.js').Message} message
 * @param {string} [text]
 * @returns {string[]}
 */
function collectUserIds(message, text = "") {
    const ids = new Set();
    for (const part of cleanInput(text)) {
        const id = extractId(part);
        if (/^\d{17,20}$/.test(String(id))) ids.add(String(id));
    }
    message?.mentions?.users?.forEach((u) => ids.add(u.id));
    return [...ids];
}

module.exports = {
    cleanInput,
    extractId,
    resolveMembers,
    resolveRoles,
    resolveChannels,
    splitArgumentGroups,
    collectUserIds,
};
