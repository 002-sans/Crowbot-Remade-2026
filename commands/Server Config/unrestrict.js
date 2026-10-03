const { Client, Message } = require("discord.js");

module.exports = {
    name: "unrestrict",
    description: "Rend un émoji accessible à tout le monde",
    category: "Configuration du serveur",
    argument: "<émoji>",
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

        const emojiStrings = client.cleanInput(args.join(' '));
        const emojis = [];
        for (const s of emojiStrings) {
            const found = message.guild.emojis.cache.find(e => s.includes(e.id) || e.name === s || e.toString() === s);
            if (found && !emojis.includes(found)) emojis.push(found);
        }

        if (!emojis.length) return message.channel.send(`Aucun émoji de trouvé pour \`${args.join(' ') || "rien"}\``);

        for (const emoji of emojis) {
            await emoji.roles.set([]).catch(() => null);
        }

        if (emojis.length === 1) {
            return message.channel.send(`L'émoji ${emojis[0]} est de nouveau accessible à tout le monde`);
        }

        return message.channel.send(`\`${emojis.length}\` émoji(s) sont de nouveau accessibles à tout le monde`);
    },
};
