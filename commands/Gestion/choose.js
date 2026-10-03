const { Client, Message } = require("discord.js");

module.exports = {
    name: "choose",
    description: "Lance un tirage au sort instantané sur un message",
    category: "Gestion",
    argument: "",
    aliases: [],
    permissions: [],
    perm: 4,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {
        const question = await message.channel.send('Envoyez l’ID du message à utiliser');
        const collected = await message.channel.awaitMessages({
            filter: m => m.author.id === message.author.id,
            max: 1,
            time: 60000
        });
        const response = collected.first();
        question.delete().catch(() => null);
        response?.delete().catch(() => null);
        const target = response ? await message.channel.messages.fetch(response.content.trim()).catch(() => null) : null;
        if (!target) return message.channel.send("Aucun message de trouvé");

        const users = new Map();
        for (const reaction of target.reactions.cache.values()) {
            const fetched = await reaction.users.fetch().catch(() => null);
            if (!fetched) continue;
            for (const user of fetched.values()) {
                if (!user.bot) users.set(user.id, user);
            }
        }

        if (!users.size) return message.channel.send("Personne ne correspond aux conditions du tirage au sort, je ne peux pas tirer de gagnant");
        const list = [...users.values()];
        const winner = list[Math.floor(Math.random() * list.length)];
        message.channel.send(`Le gagnant est ${winner} (\`${winner.tag}\`)`);
    },
};
