const { Client, Message } = require("discord.js");

module.exports = {
    name: "changeall",
    description: "Transfere toutes les commandes d'une permission vers une autre",
    category: "Owners",
    argument: "<permission> <permission>",
    aliases: [],
    permissions: [],
    perm: 8,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        const from = parseInt(args[0]);
        const to = parseInt(args[1]);
        if (isNaN(from) || isNaN(to) || from < 1 || from > 9 || to < 1 || to > 9) return message.channel.send('Les niveaux doivent être entre 1 et 9');
        if (!db.perms.change) db.perms.change = {};
        let count = 0;
        for (const [name, cmd] of client.commands) {
            const current = db.perms.change[name] ?? cmd.perm;
            if (Number(current) === from) {
                db.perms.change[name] = to;
                count++;
            }
        }
        client.save(message.guildId);
        message.channel.send(`\`${count}\` commandes ont été transférées de la permission \`${from}\` vers \`${to}\``);

    },
};
