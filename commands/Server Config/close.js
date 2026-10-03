const { Client, Message } = require("discord.js");

module.exports = {
    name: "close",
    description: "Ferme le ticket",
    category: "Configuration du serveur",
    argument: "[raison]",
    aliases: [],
    permissions: [],
    perm: 7,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        const modmailTicket = db.modmail?.open?.find(ticket => ticket.channelId === message.channelId);
        if (modmailTicket) {
            const reason = args.join(' ') || 'Aucune raison';
            const user = await client.users.fetch(modmailTicket.userId).catch(() => null);
            db.modmail.open = db.modmail.open.filter(ticket => ticket.channelId !== message.channelId);
            client.save(message.guildId);
            if (user) await user.send({ embeds: [new (require('discord.js').EmbedBuilder)().setTitle(`Ticket Fermé: ${reason}`).setColor(db.color)] }).catch(() => null);
            await message.channel.send({ embeds: [new (require('discord.js').EmbedBuilder)().setTitle(`Ticket Fermé: ${reason}`).setColor(db.color)] }).catch(() => null);
            return message.channel.delete('Modmail fermé').catch(() => null);
        }
        if (!db.tickets?.open) db.tickets.open = [];
        const ticket = db.tickets.open.find(t => t.channelId === message.channel.id);
        if (!ticket) return message.channel.send("Cette commande doit être utilisée dans un ticket");
        db.tickets.open = db.tickets.open.filter(t => t.channelId !== message.channel.id);
        client.save(message.guildId);
        message.channel.send(`Ticket fermé${args[0] ? ` : \`${args.join(' ')}\`` : ''}`);
        setTimeout(() => message.channel.delete().catch(() => null), 3000);

    },
};
