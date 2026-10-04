const { EmbedBuilder, Client, Message, GuildVerificationLevel } = require("discord.js");

module.exports = {
    name: "serverinfo",
    description: "Affiche les informations du serveur.",
    category: "Utilitaire",
    aliases: [ 'server-info', 'si' ],
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
        const guild = message.guild;
        const owner = await guild.members.fetch(guild.ownerId).catch(() => null);

        await guild.members.fetch().catch(() => null);
        const boosters = guild.members.cache.filter(m => m.premiumSince).size;

        const embed = new EmbedBuilder()
            .setColor(db.color)
            .setTitle(`Informations du serveur`)
            .setThumbnail(guild.iconURL())
            .setDescription(`\`🎩\`・**__Informations du serveur__**
                > **Serveur**: \`${guild.name}\` (\`${guild.id}\`)
                > **Propriétaire:** ${owner ?? guild.ownerId} (\`${owner?.user?.username ?? "?"}\` | \`${guild.ownerId}\`)
                > **Création du serveur** <t:${Math.round(guild.createdTimestamp / 1000)}:f> (<t:${Math.round(guild.createdTimestamp / 1000)}:R>)
                > **Invitation personnalisée:** ${guild.vanityURLCode ? `\`${guild.vanityURLCode}\` (${guild.vanityURLUses ?? 0} utilisations)` : "`❌`"}
                > **Description:** \`${guild.description ?? "❌"}\`
                \`🍁\`・**__Statistiques du serveur__**
                > **Nombre de membres:** \`${guild.memberCount} membres\`
                > **Nombre de salons:** \`${guild.channels.cache.size} salons\`
                > **Nombre de rôles:** \`${guild.roles.cache.size} rôles\`
                > **Nombre de boosts:** \`${guild.premiumSubscriptionCount ?? 0} (${boosters} utilisateur(s))\`
                > **Nombre d'émojis:** \`${guild.emojis.cache.size} emojis\`
                > **Nombre de stickers:** \`${guild.stickers.cache.size} stickers\`
                \`🌂\`・**__Paramètres du serveur__**
                > **Niveau de vérification:** \`${verif(guild.verificationLevel)}\`
                > **Barre des boosts:** \`${guild.premiumProgressBarEnabled ? "✅" : "❌"}\`
                > **Salon du système:** ${guild.systemChannel ? `${guild.systemChannel} (\`${guild.systemChannel.name}\` | \`${guild.systemChannel.id}\`)` : "❌"}`.replaceAll('                ', ''))

        message.channel.send({ embeds: [ embed ] });
    },
};

function verif(level) {
    switch (level) {
        case GuildVerificationLevel.None: return "Aucune";
        case GuildVerificationLevel.Low: return "Faible";
        case GuildVerificationLevel.Medium: return "Normal";
        case GuildVerificationLevel.High: return "Élevé";
        case GuildVerificationLevel.VeryHigh: return "Maximum";
        default: return "Aucune";
    }
}
