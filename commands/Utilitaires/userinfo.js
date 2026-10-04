const { EmbedBuilder, Client, Message } = require("discord.js");

const varsbadge = {
    'HypeSquadOnlineHouse1': "HypeSquad Bravery",
    'HypeSquadOnlineHouse2': "HypeSquad Brilliance",
    'HypeSquadOnlineHouse3': "HypeSquad Balance",
    'HypeSquadEvents': "HypeSquad Event",
    'ActiveDeveloper': 'Active Developer',
    'BugHunterLevel1': 'Bug Hunter Level 1',
    'EarlySupporter': 'Early Supporter',
    'VerifiedDeveloper': 'Verified Bot Developer',
    'PremiumEarlySupporter': 'Early Supporter',
    'Staff': "Discord Staff",
    'Partner': "Partnered Server Owner",
    'BugHunterLevel2': 'Bug Hunter Level 2',
};

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
        const raw = args[0] ? (client.resolvers.extractId(args[0]) || args[0]) : null;
        let user = message.mentions.users.first()
            || (raw ? client.users.cache.get(raw) : null)
            || (raw ? await client.users.fetch(raw).catch(() => null) : null);
        if (!user) user = message.author;

        await user.fetch().catch(() => null);
        const member = message.guild.members.cache.get(user.id)
            || await message.guild.members.fetch(user.id).catch(() => null);
        const displayName = member?.displayName ?? user.globalName ?? user.username;
        const flagList = user.flags?.toArray?.() ?? [];
        const badges = flagList.length === 0
            ? "`Aucun badge`"
            : flagList.map(r => `\`${varsbadge[r] ?? r}\``).join(', ');

        let commonGuilds = 0;
        for (const g of client.guilds.cache.values()) {
            if (g.members.cache.has(user.id)) commonGuilds++;
            else if (await g.members.fetch(user.id).catch(() => null)) commonGuilds++;
        }

        const embed = new EmbedBuilder()
            .setColor(db.color)
            .setTitle(`Informations sur ${displayName}`)
            .setThumbnail(user.displayAvatarURL())
            .setDescription(`\`👤\`・**__Informations sur l'utilisateur__**
                > **Utilisateur**: ${user} (\`${displayName}\` | \`${user.id}\`)
                > **Date de création:** <t:${Math.round(user.createdTimestamp / 1000)}:f> (<t:${Math.round(user.createdTimestamp / 1000)}:R>)
                > **Bot:** ${user.bot ? "`✅`" : "`❌`"}
                > **Badges:** ${badges}
                > **Serveurs en communs:** \`${commonGuilds}\``.replaceAll('                ', ''));

        if (user.banner) embed.setImage(user.bannerURL({ size: 4096 }));
        message.channel.send({ embeds: [embed] });
    },
};
