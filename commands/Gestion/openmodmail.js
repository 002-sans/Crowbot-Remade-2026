const { Client, Message, ChannelType, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "openmodmail",
    description: "Ouvre un ticket modmail manuellement",
    category: "Gestion",
    argument: "<membre>",
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        if (!db.modmail?.actif || db.modmail.guildId !== message.guildId) return message.channel.send("Les modmails ne sont pas configurés");
        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || await message.guild.members.fetch(args[0]).catch(() => null);
        if (!member) return message.channel.send(`Aucun membre de trouvé pour \`${args[0] ?? "rien"}\``);
        if ((db.modmail.open || []).some(t => t.userId === member.id)) return message.channel.send("Un modmail est déjà ouvert avec ce membre");
        const category = message.guild.channels.cache.get(db.modmail.category);
        const channel = await message.guild.channels.create({
            name: `modmail-${member.user.username}`.slice(0, 100),
            type: ChannelType.GuildText,
            parent: category?.id,
            permissionOverwrites: [
                { id: message.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
            ]
        }).catch(() => null);
        if (!channel) return message.channel.send("Impossible de créer le salon");
        db.modmail.open.push({ userId: member.id, channelId: channel.id });
        client.save(message.guildId);
        await channel.send({ embeds: [new EmbedBuilder()
            .setTitle('Nouveau ticket ouvert')
            .setDescription(`Utilisez la commande \`${db.prefix}r <message>\` pour répondre à ce ticket\nUtilisez la commande \`${db.prefix}close [raison]\` pour le fermer`)
            .setColor(db.color)] });
        message.channel.send(`Ticket ouvert avec ${member}: ${channel}`);

    },
};
