const { Client, Message } = require("discord.js");

module.exports = {
    name: "unowner",
    description: "Retire un owner du bot",
    category: "Owners",
    aliases: [],
    permissions: [],
    argument: "<user>",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    botBuyerOnly: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const user = message.mentions.users.first() || client.users.cache.get(args[0]) || await client.users.fetch(args[0]).catch(() => null);

        if (!user) return message.channel.send(`Aucun utilisateur de trouvé pour \`${args[0] ?? "rien"}\``);
        if (client.isBuyer(user.id)) return message.channel.send(`Impossible de retirer le **buyer**`);
        if (!(client.config.owners || []).includes(user.id)) return message.channel.send(`${user.displayName} n'est pas owner`);

        client.config.owners = client.config.owners.filter(id => id !== user.id);
        client.saveConfig();

        message.channel.send(`${user.displayName} n'est plus **owner**`);
    },
};
