const { PermissionsBitField, EmbedBuilder, Client, Message } = require("discord.js");

const varsbadge = {
    'HypeSquadOnlineHouse1': "HypeSquad Bravery",
    'HypeSquadOnlineHouse2': "HypeSquad Brilliance",
    'HypeSquadOnlineHouse3': "HypeSquad Balance",
    'HypeSquadEvents': "HypeSquad Event",
    'ActiveDeveloper': 'Active Developer',
    'BugHunterLeve1': 'Bug Hunter Level 1',
    'EarlySupporter': 'Early Supporter',
    'VerifiedBotDeveloper': 'Verified Bot Developer',
    'EarlyVerifiedBotDeveloper': "Early Verified Bot Developer",
    'VerifiedBot': "Verified Bot",
    'PartneredServerOwner': "Partnered Server Owner",
    'Staff': "Discord Staff",
    'System': "Discord System",
    'BugHunterLevel2': 'Bug Hunter Level 2',
}

module.exports = {
    name: "user",
    description: "Affiche les informations d'un utilisateur.",
    category: "Utilitaire",
    aliases: [ "userinfo", "ui" ],
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
 
        await user.fetch();
        const embed = new EmbedBuilder()
            .setColor(db.color)
            .setTitle(`Informations sur ${user.displayName}`)
            .setThumbnail(user.displayAvatarURL())
            .setDescription(`\`👤\`・**__Informations sur l'utilisateur__**
                > **Utilisateur**: ${user} (\`${user.displayName}\` | \`${user.id}\`)
                > **Date de création:** <t:${Math.round(user.createdTimestamp / 1000)}:f> (<t:${Math.round(user.createdTimestamp / 1000)}:R>)
                > **Bot:** ${user.bot ? "`✅`" : "`❌`"}
                > **Badges:** ${user.flags.toArray().length == 0 ? "`Aucun badge`" : user.flags.toArray().map(r => `\`${varsbadge[r]}\``).join(', ')}
                > **Serveurs en communs:** \`${client.guilds.cache.filter(g => g.members.cache.has(user.id)).size}\``.replaceAll('                ', ''))

        if (user.banner) embed.setImage(user.bannerURL({ size: 4096 }));
        message.channel.send({ embeds: [ embed ] })
    },
}