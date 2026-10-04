const { PermissionsBitField, Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "sanctions",
    description: "Affiche les sanctions reçues par un membre",
    category: "Modération",
    argument: "<membre>",
    aliases: [],
    perm: 2,
    permissions: [PermissionsBitField.Flags.SendMessages],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (!args[0]) return;
        const db = client.get(message.guildId);
        const raw = client.resolvers.extractId(args[0]) || args[0];
        const member = message.mentions.members.first()
            || message.guild.members.cache.get(raw)
            || await message.guild.members.fetch(raw).catch(() => null);
        if (!member) return message.channel.send(`Aucun membres trouvé pour \`${args[0]}\``);

        if (!Array.isArray(db.warns)) db.warns = [];
        const warns = db.warns.filter(c => c.id == member.id);
        const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
            .setColor(db.color)
            .setDescription(`${warns.length == 0 ? "**Aucune sanction reçue**" : warns.map((r, i) => `${i+1} - ${r.reason}`).join('\n')}`)
        if (warns.length) embed.setFooter({ text: db.footer ?? 'ζ͜͡Crow Bots' })

        message.channel.send({ embeds: [embed] });
    },
}