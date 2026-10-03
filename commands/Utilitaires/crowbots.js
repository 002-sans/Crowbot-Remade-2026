const { EmbedBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "crowbots",
    description: "Affiche le serveur support.",
    category: "Utilitaire",
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const embed = new EmbedBuilder()            
            .setColor(db.color)
            .setDescription(`[Cliquez pour rejoindre le support Crow Bots](${client.config.support})`);

        message.channel.send({ embeds: [ embed ] });
    },
};
