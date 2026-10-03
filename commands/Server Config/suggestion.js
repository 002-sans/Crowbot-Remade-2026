const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "suggestion",
    description: "Poste une suggestion ou configure le système",
    category: "Configuration du serveur",
    argument: "<message/settings>",
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        if (!db.suggestions) db.suggestions = { channel: null, actif: false, list: [] };

        if (args[0] === 'settings') {
            if (!client.perm(7, message.author.id, message.channel.id, message.guild)) return;
            const q = await message.channel.send("Mentionnez le salon des suggestions (ou `off`)");
            const c = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 300000 });
            q.delete().catch(() => null);
            const resp = c.first();
            resp?.delete().catch(() => null);
            if (!resp) return;
            if (resp.content.toLowerCase() === 'off') {
                db.suggestions.actif = false;
                db.suggestions.channel = null;
                client.save(message.guildId);
                return message.channel.send("Les suggestions ont été **désactivées**");
            }
            const channel = resp.mentions.channels.first() || message.guild.channels.cache.get(resp.content);
            if (!channel) return message.channel.send("Salon invalide");
            db.suggestions.actif = true;
            db.suggestions.channel = channel.id;
            client.save(message.guildId);
            return message.channel.send(`Les suggestions seront envoyées dans ${channel}`);
        }

        if (!db.suggestions.actif || !db.suggestions.channel) {
            return message.channel.send("Il semblerait que le système de suggestions ne soit pas configuré, vous pouvez contacter un administrateur ou réessayer plus tard");
        }
        const content = args.join(' ');
        if (!content) return message.channel.send("Veuillez entrer une suggestion");
        const channel = message.guild.channels.cache.get(db.suggestions.channel);
        if (!channel) return message.channel.send("Salon de suggestions introuvable");
        const embed = new EmbedBuilder()
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
            .setColor(db.color)
            .setDescription(content)
            .setFooter({ text: db.footer ?? 'ζ͜͡Crow Bots' })
            .setTimestamp();
        const msg = await channel.send({ embeds: [embed] });
        await msg.react('👍').catch(() => null);
        await msg.react('👎').catch(() => null);
        db.suggestions.list.push({ messageId: msg.id, channelId: channel.id, authorId: message.author.id, content, createdAt: Date.now(), ups: 0 });
        client.save(message.guildId);
        message.channel.send("Suggestion **envoyée**");

    },
};
