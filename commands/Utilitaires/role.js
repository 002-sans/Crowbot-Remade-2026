const { PermissionsBitField, EmbedBuilder, Client, Message, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "role",
    description: "Affiche les informations d'un rôle.",
    category: "Utilitaire",
    aliases: [],
    permissions: [],
    perm: 1,
    argument: "<role>",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) || await message.guild.roles.fetch(args[0]).catch(() => null);
        if (!role || !args[0]) return message.channel.send(`\`❌\`・Aucun rôle de trouvé pour \`${args[0] ?? "rien"}\``);

        await message.guild.members.fetch().catch(() => null);
        const memberCount = message.guild.members.cache.filter(m => m.roles.cache.has(role.id)).size;

        const embed = new EmbedBuilder()
            .setColor(db.color)
            .addFields(
                { name: 'Nom', value: `${role}`, inline: true },
                { name: 'Membres possédant ce rôle', value: `${memberCount}`, inline: true },
                { name: 'Couleur', value: `#${role.color}`, inline: true },
                { name: 'ID', value: role.id, inline: true },
                { name: 'Affiché séparément', value: role.hoist ? '✅' : '❌', inline: true },
                { name: 'Mentionnable', value: role.mentionable ? '✅' : '❌', inline: true },
                { name: 'Gérer par une intégration', value: role.managed ? '✅' : '❌', inline: true },
            )

        message.channel.send({ embeds: [embed] })     
    },
}