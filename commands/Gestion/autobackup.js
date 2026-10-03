const { Client, Message } = require("discord.js");

module.exports = {
    name: "autobackup",
    description: "Configure les backups automatiques",
    category: "Gestion",
    argument: "<serveur/emoji> <jours>",
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        if (!db.autobackup) db.autobackup = { serveur: 0, emoji: 0 };
        const type = args[0];
        const days = parseInt(args[1]);
        const normalizedType = type === 'server' ? 'serveur' : type;
        if (!['serveur', 'emoji'].includes(normalizedType) || isNaN(days) || days < 0) return message.channel.send(`Format incorrect: essayez \`${db.prefix}autobackup server 7\``);
        db.autobackup[normalizedType] = days;
        client.save(message.guildId);
        message.channel.send(days === 0
            ? `L'autobackup \`${type}\` a été **désactivé**`
            : `L'autobackup \`${type}\` est réglé sur \`${days}\` jour${days > 1 ? 's' : ''}`);

    },
};
