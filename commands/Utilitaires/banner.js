const { PermissionsBitField, EmbedBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "banner",
    description: "Affiche la bannière d'un utilisateur.",
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
        let user = message.mentions.users.first() || client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(() => null);
        if (!user || !args[0]) user = message.author;

        await user.fetch();

        const embed = new EmbedBuilder()
            .setTitle(`Bannière de ${user.displayName}`)
            .setColor(db.color)
            
        if (user.banner) embed.setImage(user.bannerURL({ size: 4096 }))
        else embed.setDescription(`${user.displayName} n'a pas de bannière`)

        message.channel.send({ embeds: [ embed ] })
    },
}