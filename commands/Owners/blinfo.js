const { EmbedBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "blinfo",
    description: "Affiche les informations d'un utilisateur blacklist",
    category: "Owners",
    aliases: [],
    permissions: [],
    argument: "[user]",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 8,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const bl = client.getBlacklist();
        const user = message.mentions.users.first() || client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(() => null);
            
        if (!user) return message.channel.send(`Aucun utilisateur de trouvé pour \`${args[0] ?? 'rien'}\``)
        if (!bl[user.id]) return message.channel.send(`${user.displayName} n'est déjà blacklist`)
        
        const blauthor = await client.users.fetch(bl[user.id].author).catch(() => null);

        const embed = new EmbedBuilder()
            .setTitle(`Informations sur ${user.displayName}`)
            .setColor(db.color)
            .setThumbnail(user.avatarURL())
            .setDescription(`
                > **Utilisateur**: ${user} (\`${user.displayName}\` | \`${user.id}\`)
                > **Blacklist par**: ${blauthor} (\`${blauthor.displayName}\` | \`${blauthor.id}\`)
                > **Blacklist**: <t:${bl[user.id].date}:R>
                > **Raison**: \`${bl[user.id].reason ?? "Aucune raison"}\``.replaceAll('                ', ''))
        
        message.channel.send({ embeds: [ embed ] })
    },
}
