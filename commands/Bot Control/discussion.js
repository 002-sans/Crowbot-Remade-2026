const { Client, Message } = require("discord.js");

module.exports = {
    name: "discussion",
    description: "Permet de discuter à travers le bot sur un serveur",
    category: "Bot Control",
    argument: "<ID/nombre>",
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: true,
    async execute(client, message, args) {
        const index = parseInt(args[0], 10) - 1;
        const guild = (index >= 0 && index < client.guilds.cache.size) ? client.guilds.cache.at(index) : client.guilds.cache.get(args[0]);
        if (!guild) return message.channel.send('Aucun serveur de trouvé');
        const channel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased?.() && c.viewable);
        if (!channel) return message.channel.send("Aucun salon accessible");
        message.channel.send(`Discussion ouverte avec \`${guild.name}\` / \`${channel.name}\`. Envoyez \`stop\` pour arrêter.`);
        const collector = message.channel.createMessageCollector({ filter: m => m.author.id === message.author.id, time: 1000 * 60 * 30 });
        collector.on('collect', async m => {
            if (m.content.toLowerCase() === 'stop') {
                collector.stop();
                return message.channel.send("Discussion **terminée**");
            }
            await channel.send(m.content).catch(() => message.channel.send("Envoi impossible"));
        });
    },
};
