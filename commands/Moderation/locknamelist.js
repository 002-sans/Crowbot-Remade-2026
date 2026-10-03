const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "locknamelist",
    description: "Affiche la liste des pseudos verrouillés.",
    category: "Modération",
    argument: "",
    aliases: [],
    permissions: [],
    perm: 2,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
    */
    async execute(client, message) {
        const db = client.get(message.guildId);
        const locks = Object.entries(db.locknames ?? {});

        if (!locks.length)
            return message.channel.send({ embeds: [new EmbedBuilder().setTitle("Il n'y a aucun membre avec un pseudo verrouillé sur ce serveur").setColor(db.color)] });

        const description = locks.map(([userId, nickname]) => `<@${userId}> (${userId}): ${nickname}`).join("\n");
        const embed = new EmbedBuilder()
            .setTitle("Liste des pseudos verrouillés")
            .setDescription(description)
            .setColor(db.color)
            .setFooter({ text: `1/1 • ${db.footer ?? "ζ͜͡Crow Bots"}` });

        return message.channel.send({ embeds: [embed] });
    },
};
