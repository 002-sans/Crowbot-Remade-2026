const { Client, Message, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ChannelType, RoleSelectMenuBuilder, ChannelSelectMenuBuilder } = require("discord.js");

module.exports = {
    name: "public",
    description: "Autorise/interdit les commandes publiques",
    category: "Paramètres de modération",
    argument: "<on/off> <allow/deny/reset> [salon]",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 3,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]) || message.channel;

        switch(args[0]){
            case 'on':
                if (db.public.etat) return message.channel.send('Les commandes publiques sont déjà activées');

                db.public.etat = true;
                client.save(message.guildId);

                message.channel.send('Les commandes publiques sont maintenant activées');
                break;

            case 'off':
                if (db.public.etat) return message.channel.send('Les commandes publiques sont déjà désactivées');

                db.public.etat = false;
                client.save(message.guildId);

                message.channel.send('Les commandes publiques sont maintenant désactivées');
                break;

            case 'allow':
                message.channel.send(`Les __commandes publiques__ sont maintenant **autorisées** dans ${channel}`);
                
                if (db.public.disabled.includes(channel.id))  db.public.disabled = db.public.disabled.filter(c => c !== channel.id);
                if (!db.public.channels.includes(channel.id)) db.public.channels.push(channel.id);
                client.save(channel.id);
                break;

            case 'deny':
                message.channel.send(`Les __commandes publiques__ sont maintenant **interdites** dans ${channel}`);
                
                if (db.public.channels.includes(channel.id))  db.public.channels = db.public.channels.filter(c => c !== channel.id);
                if (!db.public.disabled.includes(channel.id)) db.public.disabled.push(channel.id);
                client.save(message.guildId);
                break;

            case 'reset':
                message.channel.send(`Les **permissions par défaut** des __commandes publiques__ sont maintenant appliquées dans ${channel}`);
                
                if (db.public.channels.includes(channel.id)) db.public.channels = db.public.channels.filter(c => c !== channel.id);
                if (db.public.disabled.includes(channel.id)) db.public.disabled = db.public.disabled.filter(c => c !== channel.id);
                client.save(message.guildId);
                break;
        }
    }
}