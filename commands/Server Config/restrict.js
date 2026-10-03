const { Client, Message } = require("discord.js");

module.exports = {
    name: "restrict",
    description: "Rend un émoji accessible seulement à certains rôles",
    category: "Configuration du serveur",
    argument: "<émoji> <rôle>",
    aliases: [],
    permissions: [],
    perm: 7,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (!args.length) return message.channel.send(`Aucun émoji de trouvé pour \`rien\``);

        const groups = client.resolvers.splitArgumentGroups(args.join(' '), 2);
        const emojiInput = groups[0] || args[0];
        const roleInput = groups[1] || args.slice(1).join(' ');

        const emojiStrings = client.cleanInput(emojiInput);
        const emojis = [];
        for (const s of emojiStrings) {
            const found = message.guild.emojis.cache.find(e => s.includes(e.id) || e.name === s || e.toString() === s);
            if (found && !emojis.includes(found)) emojis.push(found);
        }

        if (!emojis.length) return message.channel.send(`Aucun émoji de trouvé pour \`${emojiInput || "rien"}\``);

        const roles = await client.resolveRoles(message.guild, roleInput, message.mentions.roles);
        if (!roles.length) return message.channel.send("Veuillez mentionner au moins un rôle ou les séparer par `,,`");

        for (const emoji of emojis) {
            await emoji.roles.set(roles).catch(() => null);
        }

        if (emojis.length === 1) {
            return message.channel.send(`L'émoji ${emojis[0]} est maintenant restreint aux rôles spécifiés`);
        }

        return message.channel.send(`\`${emojis.length}\` émoji(s) sont maintenant restreints aux rôles spécifiés`);
    },
};
