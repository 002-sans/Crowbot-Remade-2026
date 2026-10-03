const { Client, Message } = require("discord.js");

module.exports = {
    name: "rename",
    description: "Permet de renommer le vocal temporaire",
    category: "Configuration du serveur",
    argument: "<nom>",
    aliases: [],
    permissions: [],
    perm: 7,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {

        const db = client.get(message.guildId);
        const tempVoc = require('../../utiles/tempvoc').getTempVocContext(message, db);
        if (tempVoc) {
            const name = args.join('-').slice(0, 100);
            if (!name) return;
            const action = require('../../utiles/tempvoc').useTempVocAction(db, tempVoc.channel.id);
            if (!action.allowed) return message.channel.send(require('../../utiles/tempvoc').limitMessage(db, action.remaining));
            await tempVoc.channel.setName(name).catch(() => null);
            client.save(message.guildId);
            return;
        }
        const ticket = (db.tickets?.open || []).find(t => t.channelId === message.channel.id);
        if (!ticket) return message.channel.send("Cette commande doit être utilisée dans un ticket");
        const name = args.join('-').slice(0, 100);
        if (!name) return message.channel.send("Veuillez entrer un nom");
        await message.channel.setName(name).catch(() => null);
        message.channel.send(`Le ticket a été renommé en \`${name}\``);

    },
};
