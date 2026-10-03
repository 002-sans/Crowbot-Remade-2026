const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "reminder",
    description: "Crée ou liste des reminders",
    category: "Configuration du serveur",
    argument: "[nombre/list]",
    aliases: [],
    permissions: [],
    perm: 7,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        if (!db.reminders) db.reminders = [];

        if (args[0] === 'list') {
            const embed = new EmbedBuilder()
                .setTitle('Reminders')
                .setColor(db.color)
                .setDescription(db.reminders.length
                    ? db.reminders.map((r, i) => `\`${i + 1}\` - <t:${Math.floor(r.date / 1000)}:R> → <#${r.channelId}> : ${r.content.slice(0, 50)}`).join('\n')
                    : 'Aucun reminder')
                .setFooter({ text: db.footer ?? 'ζ͜͡Crow Bots' });
            return message.channel.send({ embeds: [embed] });
        }

        const index = args[0] ? parseInt(args[0]) - 1 : -1;
        const editing = index >= 0 && db.reminders[index];

        const q1 = await message.channel.send("Quel message doit être envoyé ?");
        const c1 = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 300000 });
        q1.delete().catch(() => null);
        const content = c1.first()?.content;
        c1.first()?.delete().catch(() => null);
        if (!content) return;

        const q2 = await message.channel.send("Dans combien de temps ? (ex: 1h, 2d)");
        const c2 = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 300000 });
        q2.delete().catch(() => null);
        const timeStr = c2.first()?.content;
        c2.first()?.delete().catch(() => null);
        const ms = client.ms(timeStr);
        if (!ms) return message.channel.send("Durée invalide");

        const data = { content, channelId: message.channel.id, date: Date.now() + ms, authorId: message.author.id };
        if (editing) db.reminders[index] = data;
        else db.reminders.push(data);
        client.save(message.guildId);
        message.channel.send(editing ? "Le reminder a été **modifié**" : "Le reminder a été **créé**");

    },
};
