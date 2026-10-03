const { Client, Message } = require("discord.js");

module.exports = {
    name: "streamurl",
    description: "Modifie le lien twitch du bot",
    category: "Bot Control",
    argument: '<lien>',
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        if (!args[0] || !args[0].startsWith('https://twitch.tv/') || !args[0].split('.tv/')[1].length) return message.channel.send('Veuillez entrer un lien twitch valide');

        client.config.presence.url = args[0];
        client.saveConfig()

        message.channel.send(`Le lien twitch est désormais \`${args.join(' ')}\``)
        client.user.setActivity({ name: client.config.presence.name, type: client.config.presence.type, url: client.config.presence.url })
    },
}