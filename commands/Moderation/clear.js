const { Client, Message } = require("discord.js");

module.exports = {
    name: "clear",
    description: "Permet de supprimer un certain nombre de messages.",
    category: "Modération",
    argument: "[nombre] [membre]",
    aliases: [],
    permissions: [],
    perm: 2,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);

        switch (args[0]) {
            case 'status':
            case 'activity':
                if (!client.config.owners.includes(message.author.id)) return;
                client.config.presence.name = null;
                client.config.presence.type = null;
                client.saveConfig();
                client.user.setActivity(null);
                return message.channel.send("Le status a été supprimée");

            case 'limit':
                if (!client.perm(3, message.author.id, message.channel.id, message.guild)) return;
                if (isNaN(args[1])) return message.channel.send(`Nombre incorrect, essayez \`${db.prefix}clear limit 500\``);
                db.clearlimit = String(args[1]);
                client.save(message.guildId);
                return message.channel.send(`La commande clear est maintenant limité à ${args[1]} messages`);

            case 'badwords':
                if (!client.perm(3, message.author.id, message.channel.id, message.guild)) return;
                const words = db.badword.length;
                db.badword = [];
                client.save(message.guildId);
                return message.channel.send(`${words} mots interdits ont été supprimés`);

            case 'sanctions': {
                if (!client.perm(2, message.author.id, message.channel.id, message.guild)) return;
                const member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) || await message.guild.members.fetch(args[1]).catch(() => null);
                if (!member || !args[1]) return message.channel.send(`Aucun membre de trouvé pour \`${args[1] ?? "rien"}\``);
                
                const number = db.warns.filter(c => c.id == member.id).length;
                if (number == 0) return message.channel.send("Cet utilisateur n'avait reçu aucune sanction");
                
                db.warns = db.warns.filter(c => c.id !== member.id);
                client.save(message.guildId);
                return message.channel.send(`${number} sanction${number > 1 ? 's' : ''} supprimée${number > 1 ? 's' : ''} pour l'utilisateur ${member}`);
            }

            case 'all':
                if (args[1] == "sanctions") {
                    if (!client.perm(2, message.author.id, message.channel.id, message.guild)) return;
                    const members = new Set(db.warns.map(w => w.id));
                    db.warns = [];
                    client.save(message.guildId);
                    return message.channel.send(`Les sanctions de ${members.size} membre${members.size > 1 ? 's' : ''} ont été effacées`);
                }
                break;

            case 'webhooks': {
                if (!client.perm(6, message.author.id, message.channel.id, message.guild)) return;
                const webhooks = await message.guild.fetchWebhooks().catch(() => null);
                if (!webhooks || webhooks.size === 0) return message.channel.send("Aucun webhook trouvé");
                let deleted = 0;
                for (const webhook of webhooks.values()) {
                    try { await webhook.delete(`Clear webhooks par ${message.author.tag}`); deleted++; } catch {}
                }
                return message.channel.send(`\`${deleted}\` webhook${deleted > 1 ? 's' : ''} ont été **supprimés**`);
            }

            case 'perms':
                if (!client.perm(8, message.author.id, message.channel.id, message.guild)) return;
                for (let i = 1; i <= 9; i++) db.perms[String(i)] = [];
                db.perms.change = {};
                db.perms.supp = {};
                client.save(message.guildId);
                return message.channel.send("Toutes les permissions du bot ont été **supprimées**");

            case 'owners':
                if (!client.config.owners.includes(message.author.id) && client.config.buyer !== message.author.id) return;
                db.owners = [];
                client.config.owners = client.config.buyer ? [client.config.buyer] : [];
                client.save(message.guildId);
                client.saveConfig();
                return message.channel.send("Tous les owners du bot ont été **supprimés**");

            case 'bl': {
                if (!client.config.owners.includes(message.author.id) && client.config.buyer !== message.author.id) return;
                const bl = client.getBlacklist();
                const count = Object.keys(bl).length;
                for (const key of Object.keys(bl)) delete bl[key];
                client.saveBlacklist();
                return message.channel.send(`\`${count}\` membres ont été retirés de la blacklist`);
            }

            case 'customs':
                if (!client.perm(7, message.author.id, message.channel.id, message.guild)) return;
                const customs = Object.keys(db.customs || {}).length;
                db.customs = {};
                client.save(message.guildId);
                return message.channel.send(`\`${customs}\` commande${customs > 1 ? 's' : ''} custom ont été **supprimées**`);

            case 'wl':
                if (!client.perm(6, message.author.id, message.channel.id, message.guild)) return;
                db.whitelist = [];
                if (db.antiraid) db.antiraid.roles = [];
                client.save(message.guildId);
                return message.channel.send("La whitelist a été **supprimée**");
        }

        const limit = parseInt(args[0]) || parseInt(db.clearlimit);
        if (!limit || isNaN(limit) || limit < 1)
            return message.channel.send("Veuillez fournir un nombre valide supérieur à 0.");

        if (limit > Number(db.clearlimit))
            return message.channel.send(`Le nombre doit être inférieur ou égal à ${db.clearlimit}.`);

        try {
            message.delete().catch(() => null);

            if (message.mentions.members.first()) {
                const messages = await message.channel.messages.fetch();
                const filtered = messages.filter(m => m.author.id === message.mentions.members.first().id).toJSON().slice(0, limit);
                if (!filtered.length) return;
                await message.channel.bulkDelete(filtered).catch(() => {
                    return message.channel.send("Impossible de supprimer certains messages datant de plus de 14 jours.");
                });
            } else {
                const messages = await fetchAll(limit, message.channel);
                while (messages.length > 0) {
                    await message.channel.bulkDelete(messages.splice(0, 100)).catch(() => {
                        return message.channel.send(
                            `Je ne peux pas supprimer des messages datant de plus de 14 jours.\nUtilisez \`${db.prefix}renew\` pour recréer le salon sans aucun message.`
                        );
                    });
                }
            }
        } catch {}
    },
};

async function fetchAll(limit, channel) {
    let messages = [];
    let lastID;

    while (messages.length < limit) {
        const options = { limit: Math.min(100, limit - messages.length) };
        if (lastID) options.before = lastID;
        const fetched = await channel.messages.fetch(options);
        if (fetched.size === 0) break;
        messages = messages.concat(Array.from(fetched.values()));
        lastID = fetched.lastKey();
    }

    return messages.filter(msg => msg.createdAt > Date.now() - 1000 * 60 * 60 * 24 * 14);
}
