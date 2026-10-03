const { PermissionsBitField, EmbedBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "pic",
    description: "Affiche l'avatar d'un utilisateur.",
    category: "Utilitaire",
    aliases: [ 'avatar', 'pp', 'pfp' ],
    permissions: [],
    perm: 1,
    argument: "[user]",
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

        const embed = new EmbedBuilder()
            .setColor(db.color)    
            .setTitle(`Avatar de ${user.displayName}`)
            
        if (user.avatar) embed.setImage(user.avatarURL({ dynamic: true, size: 4096 }));
        else embed.setDescription(`${user.displayName} n'a pas d'avatar`);

        message.channel.send({ embeds: [ embed ] })
    },
}