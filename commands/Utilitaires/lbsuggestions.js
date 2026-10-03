const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "lb",
    description: "Affiche les suggestions les mieux notées",
    category: "Utilitaire",
    argument: "suggestions",
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        if (args[0] !== 'suggestions') return;
        const db = client.get(message.guildId);
        const list = [...(db.suggestions?.list || [])].sort((a, b) => (b.ups || 0) - (a.ups || 0)).slice(0, 10);
        const embed = new EmbedBuilder()
            .setTitle('Top suggestions')
            .setColor(db.color)
            .setDescription(list.length ? list.map((s, i) => `\`${i + 1}\` - ${s.content.slice(0, 60)} (${s.ups || 0} 👍)`).join('\n') : 'Aucune suggestion')
            .setFooter({ text: db.footer ?? 'ζ͜͡Crow Bots' });
        message.channel.send({ embeds: [embed] });

    },
};
