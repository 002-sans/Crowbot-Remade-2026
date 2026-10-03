const { Client, Message } = require("discord.js");

module.exports = {
    name: "helptype",
    description: "Change le mode de navigation du menu help",
    category: "Bot Control",
    argument: "<button/select/hybrid>",
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: true,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        if (!['button', 'select', 'hybrid'].includes(args[0])) return message.channel.send(`Utilisation: \`helptype <button/select/hybrid>\``);
        db.helptype = args[0];
        client.save(message.guildId);
        message.channel.send(`Le mode help est maintenant \`${args[0]}\``);

    },
};
