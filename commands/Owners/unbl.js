const { Client, Message } = require("discord.js");

module.exports = {
    name: "unbl",
    description: "Retire un utilisateur de la blacklist du bot",
    category: "Owners",
    aliases: [ "unblacklist" ],
    permissions: [],
    argument: "<user>",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 8,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (!args.length) return message.channel.send(`Format incorrect: essayez \`${client.config.prefix}unbl <user>\``);

        const bl = client.getBlacklist();
        const targets = client.cleanInput(args.join(' '));
        if (!targets.length && message.mentions.users.size > 0) {
            targets.push(...message.mentions.users.keys());
        }

        let unblCount = 0;
        const names = [];

        for (const target of targets) {
            const user = client.users.cache.get(target) || await client.users.fetch(target).catch(() => null);
            if (user && bl[user.id]) {
                delete bl[user.id];
                unblCount++;
                names.push(user.displayName || user.username);
            }
        }

        client.saveBlacklist();

        if (unblCount === 0) {
            return message.channel.send(`Aucun utilisateur trouvé ou blacklisté pour \`${args.join(' ')}\``);
        }

        if (unblCount === 1) {
            return message.channel.send(`${names[0]} n'est plus **blacklist**`);
        }

        return message.channel.send(`\`${unblCount}\` utilisateur(s) ne sont plus **blacklist**`);
    },
};
