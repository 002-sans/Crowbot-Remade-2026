const { Client, Message } = require("discord.js");

module.exports = {
    name: "show",
    description: "Envoie automatiquement des photos de profil",
    category: "Configuration du serveur",
    argument: "pics",
    aliases: ["showpics", "showpic"],
    permissions: [],
    perm: 7,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        if (args[0] !== 'pics') return;
        const db = client.get(message.guildId);
        if (!db.showpics) db.showpics = { actif: false, channel: null };
        const q = await message.channel.send("Mentionnez le salon (ou `off`)");
        const c = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 300000 });
        q.delete().catch(() => null);
        const resp = c.first();
        resp?.delete().catch(() => null);
        if (!resp) return;
        if (resp.content.toLowerCase() === 'off') {
            db.showpics = { actif: false, channel: null };
            client.save(message.guildId);
            return message.channel.send("Show pics a été **désactivé**");
        }
        const channel = resp.mentions.channels.first() || message.guild.channels.cache.get(resp.content);
        if (!channel) return message.channel.send("Salon invalide");
        db.showpics = { actif: true, channel: channel.id };
        client.save(message.guildId);
        message.channel.send(`Show pics activé dans ${channel}`);

    },
};
