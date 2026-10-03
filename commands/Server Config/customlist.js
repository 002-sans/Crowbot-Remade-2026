const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "customlist",
    description: "Affiche la liste des commandes custom",
    category: "Configuration du serveur",
    argument: "",
    aliases: [],
    permissions: [],
    perm: 7,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        if (!db.customs) db.customs = {};
        const keys = Object.keys(db.customs);
        const embed = new EmbedBuilder()
            .setTitle('Commandes custom')
            .setColor(db.color)
            .setDescription(keys.length ? keys.map((k, i) => `\`${i + 1}\` - \`${db.prefix}${k}\``).join('\n') : 'Aucune commande custom')
            .setFooter({ text: db.footer ?? 'ζ͜͡Crow Bots' });
        message.channel.send({ embeds: [embed] });

    },
};
