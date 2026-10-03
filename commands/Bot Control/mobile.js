const { Client, Message, DefaultWebSocketManagerOptions } = require("discord.js");

module.exports = {
    name: "mobile",
    description: "Met le bot en mode en ligne sur mobile.",
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
        client.config.presence.status = "mobile"
        client.saveConfig()
        client.user.setStatus("online")

        Object.defineProperty(DefaultWebSocketManagerOptions.identifyProperties, 'browser', {
            value: "Discord Android",
            writable: true,
            enumerable: true,
            configurable: true
        });
        const msg = await message.channel.send('Redémarrage du bot en cours...')

        client.destroy()
        client.login(client.config.token);
        msg.edit('Je suis maintenant en ligne sur mobile')
    },
}
