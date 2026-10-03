const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "changelogs",
    description: "Affiche les dernières notes de mise à jour",
    category: "Utilitaire",
    argument: "",
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        const embed = new EmbedBuilder()
            .setTitle('Changelogs')
            .setColor(db.color)
            .setDescription('**Crowbot Remade**\n- Migration LMDB\n- Nouvelles commandes CrowBot V2\n- Corrections diverses')
            .setFooter({ text: db.footer ?? 'ζ͜͡Crow Bots' })
            .setTimestamp();
        message.channel.send({ embeds: [embed] });

    },
};
