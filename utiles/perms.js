const ROMAN = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9 };

function parsePermLevel(input) {
    if (input == null) return null;
    const raw = String(input).trim().toLowerCase().replace(/^perm\s*/i, "");
    if (raw === "buyer" || raw === "owner") return raw;
    if (ROMAN[raw]) return ROMAN[raw];
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 1 && n <= 9) return n;
    return null;
}

function resolveCommand(client, name) {
    if (!name) return null;
    const key = name.toLowerCase().replace(/^\+/, '');
    return client.commands.get(key)
        || client.commands.find(c => c.aliases?.includes(key))
        || null;
}

async function resolveTargets(message, argsFrom) {
    const members = [...message.mentions.members.values()];
    const roles = [...message.mentions.roles.values()];

    for (const arg of argsFrom) {
        if (!arg || arg.startsWith('<@')) continue;
        const member = message.guild.members.cache.get(arg) || await message.guild.members.fetch(arg).catch(() => null);
        if (member && !members.find(m => m.id === member.id)) members.push(member);
        else {
            const role = message.guild.roles.cache.get(arg) || await message.guild.roles.fetch(arg).catch(() => null);
            if (role && !roles.find(r => r.id === role.id)) roles.push(role);
        }
    }

    return { members, roles };
}

function ensurePerms(db) {
    if (!db.perms) db.perms = {};
    if (!db.perms.supp) db.perms.supp = {};
    if (!db.perms.change) db.perms.change = {};
    if (!db.perms.no) db.perms.no = [];
    for (let i = 1; i <= 9; i++) {
        if (!Array.isArray(db.perms[String(i)])) db.perms[String(i)] = [];
    }
}

async function addPerm(client, message, permArg, targetArgs) {
    const db = client.get(message.guildId);
    ensurePerms(db);

    const level = parsePermLevel(permArg);

    if (level === "buyer" || level === "owner") {
        return message.channel.send(
            level === "buyer"
                ? "La permission `buyer` est définie dans le `config.json` (champ `buyer`)"
                : "Les owners se gèrent avec les commandes `owner` / `unowner` (réservées au buyer)"
        );
    }

    // +set perm 9 ban → commande ban requiert la perm 9
    if (typeof level === "number" && targetArgs?.length) {
        const cmdArg = targetArgs[0];
        const command = resolveCommand(client, cmdArg);
        const { members, roles } = await resolveTargets(message, targetArgs);

        if (command && !members.length && !roles.length) {
            db.perms.change[command.name] = level;
            client.save(message.guildId);
            return message.channel.send(`La commande \`${command.name}\` a été ajoutée à la permission \`${level}\``);
        }
    }

    const { members, roles } = await resolveTargets(message, targetArgs);
    if (!members.length && !roles.length) {
        return message.channel.send("Vous devez spécifier une commande, un membre ou un rôle");
    }

    const command = level != null ? null : resolveCommand(client, permArg);

    if (!level && !command) {
        return message.channel.send(`Aucune permission ou commande de trouvée pour \`${permArg}\``);
    }

    let addedMembers = 0;
    let addedRoles = 0;

    if (command) {
        for (const member of members) {
            if (!db.perms.supp[member.id]) db.perms.supp[member.id] = [];
            if (!db.perms.supp[member.id].includes(command.name)) {
                db.perms.supp[member.id].push(command.name);
                addedMembers++;
            }
        }
        for (const role of roles) {
            if (!db.perms.supp[role.id]) db.perms.supp[role.id] = [];
            if (!db.perms.supp[role.id].includes(command.name)) {
                db.perms.supp[role.id].push(command.name);
                addedRoles++;
            }
        }
        client.save(message.guildId);
        const parts = [];
        if (addedMembers) parts.push(`${addedMembers} membre${addedMembers > 1 ? "s" : ""}`);
        if (addedRoles) parts.push(`${addedRoles} rôle${addedRoles > 1 ? "s" : ""}`);
        return message.channel.send(
            parts.length
                ? `La permission \`${command.name}\` a été ajoutée à ${parts.join(" et ")}`
                : `Cette permission était déjà attribuée`
        );
    }

    const key = String(level);
    for (const member of members) {
        if (!db.perms[key].find(c => c.userId === member.id)) {
            db.perms[key].push({ userId: member.id });
            addedMembers++;
        }
    }
    for (const role of roles) {
        if (!db.perms[key].find(c => c.roleId === role.id)) {
            db.perms[key].push({ roleId: role.id });
            addedRoles++;
        }
    }
    client.save(message.guildId);
    const parts = [];
    if (addedMembers) parts.push(`${addedMembers} membre${addedMembers > 1 ? "s" : ""}`);
    if (addedRoles) parts.push(`${addedRoles} rôle${addedRoles > 1 ? "s" : ""}`);
    return message.channel.send(
        parts.length
            ? `La permission \`${level}\` a été ajoutée à ${parts.join(" et ")}`
            : `Cette permission était déjà attribuée`
    );
}

async function removePerm(client, message, permArg, targetArgs) {
    const db = client.get(message.guildId);
    ensurePerms(db);

    const level = parsePermLevel(permArg);

    if (level === "buyer" || level === "owner") {
        return message.channel.send(
            level === "buyer"
                ? "La permission `buyer` est définie dans le `config.json` (champ `buyer`)"
                : "Les owners se gèrent avec les commandes `owner` / `unowner` (réservées au buyer)"
        );
    }

    // +del perm 9 ban → retire le change de niveau pour la commande
    if (typeof level === "number" && targetArgs?.length) {
        const command = resolveCommand(client, targetArgs[0]);
        const { members, roles } = await resolveTargets(message, targetArgs);

        if (command && !members.length && !roles.length) {
            if (db.perms.change[command.name] == null) {
                return message.channel.send(`La commande \`${command.name}\` n'était pas liée à une permission custom`);
            }
            delete db.perms.change[command.name];
            client.save(message.guildId);
            return message.channel.send(`La commande \`${command.name}\` a été retirée de la permission custom (retour au défaut)`);
        }
    }

    const { members, roles } = await resolveTargets(message, targetArgs);
    if (!members.length && !roles.length) {
        return message.channel.send("Vous devez spécifier une commande, un membre ou un rôle");
    }

    const command = level != null ? null : resolveCommand(client, permArg);

    if (!level && !command) {
        return message.channel.send(`Aucune permission ou commande de trouvée pour \`${permArg}\``);
    }

    let removedMembers = 0;
    let removedRoles = 0;

    if (command) {
        for (const member of members) {
            if (!db.perms.supp[member.id]?.includes(command.name)) continue;
            db.perms.supp[member.id] = db.perms.supp[member.id].filter(c => c !== command.name);
            if (!db.perms.supp[member.id].length) delete db.perms.supp[member.id];
            removedMembers++;
        }
        for (const role of roles) {
            if (!db.perms.supp[role.id]?.includes(command.name)) continue;
            db.perms.supp[role.id] = db.perms.supp[role.id].filter(c => c !== command.name);
            if (!db.perms.supp[role.id].length) delete db.perms.supp[role.id];
            removedRoles++;
        }
        client.save(message.guildId);
        const parts = [];
        if (removedMembers) parts.push(`${removedMembers} membre${removedMembers > 1 ? "s" : ""}`);
        if (removedRoles) parts.push(`${removedRoles} rôle${removedRoles > 1 ? "s" : ""}`);
        return message.channel.send(
            parts.length
                ? `La permission \`${command.name}\` a été retirée de ${parts.join(" et ")}`
                : `Cette permission n'était pas attribuée`
        );
    }

    const key = String(level);
    for (const member of members) {
        if (!db.perms[key].find(c => c.userId === member.id)) continue;
        db.perms[key] = db.perms[key].filter(c => c.userId !== member.id);
        removedMembers++;
    }
    for (const role of roles) {
        if (!db.perms[key].find(c => c.roleId === role.id)) continue;
        db.perms[key] = db.perms[key].filter(c => c.roleId !== role.id);
        removedRoles++;
    }
    client.save(message.guildId);
    const parts = [];
    if (removedMembers) parts.push(`${removedMembers} membre${removedMembers > 1 ? "s" : ""}`);
    if (removedRoles) parts.push(`${removedRoles} rôle${removedRoles > 1 ? "s" : ""}`);
    return message.channel.send(
        parts.length
            ? `La permission \`${level}\` a été retirée de ${parts.join(" et ")}`
            : `Cette permission n'était pas attribuée`
    );
}

module.exports = {
    parsePermLevel,
    resolveCommand,
    addPerm,
    removePerm,
    ensurePerms,
};
