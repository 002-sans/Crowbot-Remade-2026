const { Client, Message } = require("discord.js");

module.exports = {
    name: "compet",
    description: "Change l'activité du bot en participe à ...",
    category: "Bot Control",
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
        if (!args[0]) return message.channel.send('Veuillez entrer une activitée valide');

        client.config.presence.name = args.join(' ')
        client.config.presence.type = 5
        client.saveConfig()
        message.channel.send(`Je vais maintenant participer à \`${args.join(' ')}\``)
        client.user.setActivity({ name: client.config.presence.name, type: client.config.presence.type, url: client.config.presence.url })
    },
}