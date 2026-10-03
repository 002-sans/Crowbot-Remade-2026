const { Client, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    name: "formulaire",
    description: "Crée un formulaire avec bouton",
    category: "Gestion",
    argument: "[ID]",
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        if (!db.formulaires) db.formulaires = [];

        const q1 = await message.channel.send("Quel titre pour le formulaire ?");
        const c1 = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 300000 });
        q1.delete().catch(() => null);
        const title = c1.first()?.content;
        c1.first()?.delete().catch(() => null);
        if (!title) return;

        const q2 = await message.channel.send("Quelle description ?");
        const c2 = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 300000 });
        q2.delete().catch(() => null);
        const description = c2.first()?.content;
        c2.first()?.delete().catch(() => null);
        if (!description) return;

        const q3 = await message.channel.send("Dans quel salon envoyer les réponses ?");
        const c3 = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 300000 });
        q3.delete().catch(() => null);
        const logInput = c3.first()?.content?.trim();
        const logChannel = c3.first()?.mentions.channels.first() || message.guild.channels.cache.get(logInput);
        c3.first()?.delete().catch(() => null);
        if (!logChannel && logInput?.toLowerCase() !== 'none' && logInput?.toLowerCase() !== 'aucun') return message.channel.send("Salon invalide");

        const id = Date.now().toString(36);
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`formulaire_${id}`).setLabel('cliques-ici').setStyle(ButtonStyle.Primary)
        );
        const msg = await message.channel.send({ content: `Cliques sur le bouton ci-dessous pour répondre au formulaire: ${title}`, components: [row] });
        db.formulaires.push({ id, title, description, logChannelId: logChannel?.id || null, messageId: msg.id, channelId: message.channel.id });
        client.save(message.guildId);
        message.channel.send("Le formulaire a été **créé**");
        if (!logChannel) message.channel.send("⚠️ Vous n'avez pas mis de salon de logs, vous ne pourrez donc pas voir le résultat du formulaire");

    },
};
