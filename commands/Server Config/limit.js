const { Client, Message } = require('discord.js');
const { getTempVocContext, useTempVocAction, limitMessage } = require('../../utiles/tempvoc');

module.exports = {
    name: 'limit',
    description: 'Permet de modifier la limite du vocal temporaire',
    category: 'Configuration du serveur',
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const context = getTempVocContext(message, db);
        const value = Number(args[0]);
        if (!context || !Number.isInteger(value) || value < 0 || value > 99) return;
        const action = useTempVocAction(db, context.channel.id);
        if (!action.allowed) return message.channel.send(limitMessage(db, action.remaining));
        await context.channel.setUserLimit(value);
        client.save(message.guildId);
        return message.channel.send('Limite mise à jour');
    }
};
