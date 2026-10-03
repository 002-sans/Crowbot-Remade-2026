const { Client, Message } = require("discord.js");

module.exports = {
    name: "reset",
    description: "Réinitialise les paramètres du bot",
    category: "Bot Control",
    argument: "<server/all>",
    aliases: ["resetall"],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: true,
    async execute(client, message, args) {

        const example = require('../../serveurs/example.json');
        const target = args[0] === 'all' || message.content.toLowerCase().includes('resetall') ? 'all' : args[0];

        if (target === 'server') {
            const data = structuredClone(example);
            data.prefix = client.config.prefix;
            await client.db.set(`guild:${message.guildId}`, data);
            client.db.invalidateGuild?.(message.guildId);
            const cached = client.get(message.guildId);
            Object.keys(cached).forEach(k => delete cached[k]);
            Object.assign(cached, structuredClone(data));
            client.save(message.guildId);
            return message.channel.send("Les paramètres du serveur ont été **réinitialisés**");
        }
        if (target === 'all') {
            for (const g of client.guilds.cache.values()) {
                const data = structuredClone(example);
                data.prefix = client.config.prefix;
                await client.db.set(`guild:${g.id}`, data);
                client.db.invalidateGuild?.(g.id);
            }
            return message.channel.send("Tous les paramètres du bot ont été **réinitialisés**");
        }
        message.channel.send(`Utilisation: \`reset <server/all>\``);

    },
};
