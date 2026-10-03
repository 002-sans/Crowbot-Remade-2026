const { Client, Message } = require("discord.js");

module.exports = {
    name: "report",
    description: "Paramètre les reports",
    category: "Configuration du serveur",
    argument: "settings",
    aliases: [],
    permissions: [],
    perm: 7,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        if (args[0] !== 'settings') return;
        const db = client.get(message.guildId);
        if (!db.report) db.report = { actif: false, channel: null };
        const q = await message.channel.send("Mentionnez le salon des reports (ou `off`)");
        const c = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 300000 });
        q.delete().catch(() => null);
        const resp = c.first();
        resp?.delete().catch(() => null);
        if (!resp) return;
        if (resp.content.toLowerCase() === 'off') {
            db.report = { actif: false, channel: null };
            client.save(message.guildId);
            return message.channel.send("Les reports ont été **désactivés**");
        }
        const channel = resp.mentions.channels.first() || message.guild.channels.cache.get(resp.content);
        if (!channel) return message.channel.send("Salon invalide");
        db.report = { actif: true, channel: channel.id };
        client.save(message.guildId);
        message.channel.send(`Les reports seront envoyés dans ${channel}`);

    },
};
