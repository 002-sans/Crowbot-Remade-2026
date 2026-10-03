const { PermissionsBitField, EmbedBuilder, Client, Message } = require("discord.js");

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
        const owner = await message.guild.members.fetch(message.guild.ownerId);

        const embed = new EmbedBuilder()
            .setColor(db.color)
            .setTitle(`Informations du serveur`)
            .setThumbnail(message.guild.iconURL())
            .setDescription(`\`🎩\`・**__Informations du serveur__**
                > **Serveur**: \`${message.guild.name}\` (\`${message.guild.id}\`)
                > **Propriétaire:** ${owner} (\`${owner.user.username}\` | \`${owner.id}\`)
                > **Création du serveur** <t:${Math.round(message.guild.createdTimestamp / 1000)}:f> (<t:${Math.round(message.guild.createdTimestamp / 1000)}:R>)
                > **Invitation personnalisée:** ${message.guild.vanityURLCode ? `\`${message.guild.vanityURLCode}\` (${message.guild.vanityURLUses} Utilisations)` : "`❌`"}
                > **Description:** \`${message.guild.description ?? "❌"}\`
                \`🍁\`・**__Statistiques du serveur__**
                > **Nombre de membres:** \`${message.guild.memberCount} Membres\`
                > **Nombre de salons:** \`${message.guild.channels.cache.size} Salons\`
                > **Nombre de rôles:** \`${message.guild.roles.cache.size} Rôles\`
                > **Nombre de boosts:** \`${message.guild.premiumSubscriptionCount} (${message.guild.members.cache.filter(m => m.premiumSince).size} Utilisateur)\`
                > **Nombre d'émojis:** \`${message.guild.emojis.cache.size} emojis\`
                > **Nombre de stickers:** \`${message.guild.stickers.cache.size} sticker\`
                \`🌂\`・**__Paramètres du serveur__**
                > **Niveau de vérification:** \`${verif(message.guild.verificationLevel)}\`
                > **Barre des boosts:** \`${message.guild.premiumProgressBarEnabled ? "✅" : "❌"}\`
                > **Salon du système:** ${message.guild.systemChannel ? `${message.guild.systemChannel} (\`${message.guild.systemChannel.name}\` | \`${message.guild.systemChannel.id}\`)` : "❌"}`.replaceAll('                ', ''))

                
        message.channel.send({ embeds: [ embed ] })
    },
}

function verif(type){
    switch(type){
        default: return "Aucune";
        case "Low": return "Faible";
        case "Medium": return "Normal";
        case "High": return "Elevé";
        case "VeryHigh": return "Maximum"
    }
}