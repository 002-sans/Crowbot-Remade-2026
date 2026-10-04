const { Client, Message } = require("discord.js");

module.exports = {
    name: "set",
    description: "Modifie le bot ou le rôle mute",
    category: "Bot Control",
    aliases: [],
    permissions: [],
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        let link = null;
        const isOwner = (client.config.owners || []).includes(message.author.id) || client.config.buyer === message.author.id;

        if (args[0] === 'perm') {
            if (!client.perm(8, message.author.id, message.channel.id, message.guild) && !isOwner) return;
            const { addPerm } = require('../../utiles/perms');
            if (!args[1] || !args[2]) {
                return message.channel.send(`Utilisation: \`${db.prefix}set perm <niveau> <commande|/[@role/@membre]>\``);
            }
            return addPerm(client, message, args[1], args.slice(2));
        }

        if (args[0] === 'muterole') {
            if (!client.perm(3, message.author.id, message.channel.id, message.guild) && !isOwner) return;
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]) || await message.guild.roles.fetch(args[1]).catch(() => null);
            if (!role) return message.channel.send(`Aucun rôle de trouvé pour \`${args[1] ?? "rien"}\``);
            db.muterole = role.id;
            client.save(message.guildId);
            return message.channel.send(`Le rôle mute est maintenant ${role}`);
        }

        if (args[0] === 'modlog') {
            if (!client.perm(3, message.author.id, message.channel.id, message.guild) && !isOwner) return;
            return require('../Logs/set-modlog').execute(client, message, args.slice(1));
        }

        if (args[0] === 'visible' || args[0] === 'invisible') {
            const { getTempVocContext, useTempVocAction, limitMessage } = require('../../utiles/tempvoc');
            const context = getTempVocContext(message, db);
            if (!context) return;
            const action = useTempVocAction(db, context.channel.id);
            if (!action.allowed) return message.channel.send(limitMessage(db, action.remaining));
            const visible = args[0] === 'visible';
            await context.channel.permissionOverwrites.edit(message.guild.roles.everyone, { ViewChannel: visible });
            client.save(message.guildId);
            return message.channel.send(visible ? 'Le salon est maintenant visible par tout le monde' : 'Le salon est maintenant invisible');
        }

        if (args[0] === 'profil') {
            if (!isOwner) return;
            return require('../../utiles/profileMenu').profileMenu(client, message, 'global');
        }

        if (args[0] === 'server' && args[1] === 'profil') {
            if (!isOwner) return;
            return require('../../utiles/profileMenu').profileMenu(client, message, 'server');
        }

        if (!isOwner) return;

        switch (args[0]) {
            case 'name':
                if (!args[1]) return message.channel.send('Veuillez entrer un nom valide');
                client.user.setUsername(args.slice(1).join(' '))
                    .then(() => message.channel.send(`Mon nouveau pseudo est \`${args.slice(1).join(' ')}\``))
                    .catch(() => message.channel.send("Je n'ai pas pu modifier mon pseudo"));
                break;

            case 'pic': {
                const ask = await message.channel.send("Envoyez ma nouvelle photo (lien ou image)");
                const collected = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 1000 * 60 * 5 });
                ask.delete().catch(() => null);
                const first = collected.first();
                if (!first) return;
                if (first.attachments.size > 0) link = first.attachments.first().url;
                else if (/^https?:\/\/.*\/.*\.(png|gif|webp|jpeg|jpg|svg)\??.*$/gmi.test(first.content)) link = first.content;
                first.delete().catch(() => null);
                if (!link) return message.channel.send('Veuillez entrer un lien ou une image valide');
                client.user.setAvatar(link)
                    .then(() => message.channel.send('Mon avatar a été modifiée'))
                    .catch(() => message.channel.send("Je n'ai pas pu modifier mon avatar"));
                break;
            }

            case 'banner': {
                const ask = await message.channel.send("Envoyez ma nouvelle bannière (lien ou image)");
                const collected = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 1000 * 60 * 5 });
                ask.delete().catch(() => null);
                const first = collected.first();
                if (!first) return;
                if (first.attachments.size > 0) link = first.attachments.first().url;
                else if (/^https?:\/\/.*\/.*\.(png|gif|webp|jpeg|jpg|svg)\??.*$/gmi.test(first.content)) link = first.content;
                first.delete().catch(() => null);
                if (!link) return message.channel.send('Veuillez entrer un lien ou une image valide');
                client.user.setBanner(link)
                    .then(() => message.channel.send('Ma bannière a été modifiée'))
                    .catch(() => message.channel.send("Je n'ai pas pu modifier ma bannière"));
                break;
            }

            case 'profil': {
                await message.channel.send("Envoyez mon nouveau nom");
                const collector_1 = await message.channel.awaitMessages({ filter: m => m.author.id == message.author.id, max: 1, time: 1000 * 60 * 5 });
                const first_response = collector_1?.first();
                if (!first_response || !first_response.content) return;

                await message.channel.send("Envoyez ma nouvelle photo");
                const collector_2 = await message.channel.awaitMessages({ filter: m => m.author.id == message.author.id, max: 1, time: 1000 * 60 * 5 });
                const second_response = collector_2?.first();
                if (!second_response) return;

                if (second_response.attachments.size > 0)
                    link = second_response.attachments.first().url;
                else if (/^https?:\/\/.*\/.*\.(png|gif|webp|jpeg|jpg|svg)\??.*$/gmi.test(second_response.content) === true)
                    link = second_response.content;

                if (!link) return message.channel.send('Echec de lecture du lien');

                await client.user.setUsername(first_response.content).catch(() => null);
                await client.user.setAvatar(link).catch(() => null);
                message.channel.send("Le profil du bot a été modifié");
                break;
            }
        }
    },
}
