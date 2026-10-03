const { Client, Message, EmbedBuilder } = require("discord.js");
const { ensurePerms } = require("../../utiles/perms");

module.exports = {
    name: "perms",
    description: "Affiche la liste des permissions",
    category: "Owners",
    aliases: [],
    permissions: [],
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
        ensurePerms(db);

        const format = (entries) => entries.length == 0
            ? 'Aucun'
            : entries.map(r => r.roleId ? `<@&${r.roleId}>` : `<@${r.userId}>`).join('\n');

        const embed = new EmbedBuilder()
            .setColor(db.color)
            .setTitle('Permissions du bot')
            .setFooter({ text: db.footer ?? 'ζ͜͡Crow Bots' });

        embed.addFields({
            name: 'Buyer',
            value: client.config.buyer ? `<@${client.config.buyer}>` : 'Aucun',
            inline: true,
        });
        embed.addFields({
            name: 'Owners',
            value: (client.config.owners || []).length
                ? client.config.owners.map(id => `<@${id}>`).join('\n').slice(0, 1024)
                : 'Aucun',
            inline: true,
        });

        for (let i = 1; i <= 9; i++) {
            embed.addFields({ name: `Perm ${i}`, value: format(db.perms[String(i)]), inline: true });
        }

        const suppKeys = Object.keys(db.perms.supp || {}).filter(id =>
            message.guild.roles.cache.get(id) || message.guild.members.cache.get(id)
        );

        if (suppKeys.length) {
            embed.addFields({
                name: 'Permissions supplémentaires (commandes)',
                value: suppKeys.map(id => {
                    const target = message.guild.roles.cache.get(id) ? `<@&${id}>` : `<@${id}>`;
                    return `${target}\n\`\`\`\n${db.perms.supp[id].join('\n')}\n\`\`\``;
                }).join('\n').slice(0, 1024)
            });
        }

        message.channel.send({ embeds: [embed] });
    },
};
