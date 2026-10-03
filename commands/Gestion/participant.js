const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'participant',
    description: 'Affiche les participants d’un giveaway',
    category: 'Gestion',
    argument: '<ID du message>',
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {
        const targetId = args[0] || message.reference?.messageId || client.giveawaysManager.giveaways
            .filter(g => g.guildId === message.guildId && g.channelId === message.channelId)
            .sort((a, b) => b.startAt - a.startAt)[0]?.messageId;
        const giveaway = client.giveawaysManager.giveaways.find(g =>
            g.guildId === message.guildId && g.messageId === targetId
        );
        if (!giveaway) return message.channel.send(`Aucun giveaway trouvé avec l'ID \`${targetId || 'rien'}\``);

        const entrants = await giveaway.fetchAllEntrants().catch(() => null);
        if (!entrants?.size) {
            return message.channel.send({ embeds: [new EmbedBuilder()
                .setTitle('Participants')
                .setDescription('Aucun participant')
                .setColor(client.get(message.guildId).color)] });
        }

        const description = [...entrants.values()]
            .map(user => `${user.globalName || user.username} (${user.id})`)
            .join('\n');
        return message.channel.send({ embeds: [new EmbedBuilder()
            .setTitle('Participants')
            .setDescription(description.slice(0, 4096))
            .setColor(client.get(message.guildId).color)
            .setFooter({ text: '1/1 • ζ͜͡Crow Bots' })] });
    }
};
