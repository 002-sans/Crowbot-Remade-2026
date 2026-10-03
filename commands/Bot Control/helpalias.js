const { Client, Message } = require("discord.js");

module.exports = {
    name: "helpalias",
    description: "Active/désactive l'affichage des alias dans le help",
    category: "Bot Control",
    argument: "<on/off>",
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: true,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        if (!['on', 'off'].includes(args[0])) return message.channel.send(`Utilisation: \`helpalias <on/off>\``);
        db.helpalias = args[0] === 'on';
        client.save(message.guildId);
        message.channel.send(`Les alias dans le help sont **${args[0] === 'on' ? 'activés' : 'désactivés'}**`);

    },
};
