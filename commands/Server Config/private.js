const { Client, Message } = require('discord.js');
const { getTempVocContext, useTempVocAction, limitMessage } = require('../../utiles/tempvoc');

module.exports = {
    name: 'private',
    description: 'Permet de rendre privé le vocal temporaire',
    category: 'Configuration du serveur',
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message) {
        const db = client.get(message.guildId);
        const context = getTempVocContext(message, db);
        if (!context) return;
        const action = useTempVocAction(db, context.channel.id);
        if (!action.allowed) return message.channel.send(limitMessage(db, action.remaining));
        await context.channel.permissionOverwrites.edit(message.guild.roles.everyone, { Connect: false });
        client.save(message.guildId);
        return message.channel.send('Le salon est maintenant privé');
    }
};
