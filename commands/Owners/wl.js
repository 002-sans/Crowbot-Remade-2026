const { PermissionsBitField, Client, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "wl",
    description: "Permet d'afficher la whitelist d'un serveur.",
    category: "Owners",
    argument: "[member/role/clear]",
    aliases: [ "whitelist" ],
    permissions: [],
    perm: 6,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        db.whitelist ??= [];
        db.antiraid ??= {};
        db.antiraid.roles ??= [];

        if (args[0] === "clear") {
            db.whitelist = [];
            db.antiraid.roles = [];
            client.save(message.guildId);
            return message.channel.send('La whitelist a été supprimée');
        }

        if (args.length > 0) {
            const rawInputs = client.cleanInput(args.join(' '));
            const addedMembers = [];
            const addedRoles = [];

            for (const input of rawInputs) {
                const members = await client.resolveMembers(message.guild, input);
                if (members.length > 0) {
                    for (const m of members) {
                        if (!db.whitelist.includes(m.id)) {
                            db.whitelist.push(m.id);
                            addedMembers.push(m.displayName);
                        }
                    }
                    continue;
                }

                const roles = await client.resolveRoles(message.guild, input);
                if (roles.length > 0) {
                    for (const r of roles) {
                        if (!db.antiraid.roles.includes(r.id)) {
                            db.antiraid.roles.push(r.id);
                            addedRoles.push(r.name);
                        }
                    }
                    continue;
                }
            }

            if (addedMembers.length > 0 || addedRoles.length > 0) {
                client.save(message.guildId);
                const msgs = [];
                if (addedMembers.length > 0) msgs.push(`\`${addedMembers.join(', ')}\` a été whitelist`);
                if (addedRoles.length > 0) msgs.push(`Le rôle \`${addedRoles.join(', ')}\` a été whitelist`);
                return message.channel.send(msgs.join('\n'));
            }

            return message.channel.send(`Aucun membre ou rôle trouvé pour \`${args.join(' ')}\``);
        }

        const whitelists = db.whitelist?.filter(r => message.guild.members.cache.get(r)) ?? [];
        const roles = db.antiraid.roles?.filter(r => message.guild.roles.cache.get(r)) ?? [];

        let p0 = 0;
        let p1 = 10;
        let page = 1;

        const embed = new EmbedBuilder()
            .setTitle('Whitelist')
            .setColor(db.color)
            .addFields(
                { name: "Membres", value: whitelists.length === 0 ? "Aucun utilisateur" : whitelists.map((m, i) => `\`${i+1}\` - <@${m}>`).slice(p0, p1).join('\n'), inline: true },
                { name: "Rôles", value: roles.length === 0 ? "Aucun rôle" : roles.map((m, i) => `\`${i+1}\` - <@&${m}>`).slice(p0, p1).join('\n'), inline: true }
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('back').setLabel('◀').setStyle(2),
            new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(2)
        );

        const msg = await message.channel.send({ embeds: [ embed ], components: (whitelists.length > p1 || roles.length > p1) ? [ row ] : [] });
        const filter = i => { i.deferUpdate(); return i.user.id === message.author.id };
        const collector = msg.createMessageComponentCollector({ filter, time: 1000 * 60 * 10 });

        collector.on('end', () => msg.edit({ components: [] }).catch(() => null));
        collector.on('collect', async i => {
            const maxPage = Math.max(1, Math.ceil(Math.max(whitelists.length, roles.length) / 10));
            if (i.customId === 'back') {
                if (page - 1 < 1) return;
                p0 -= 10;
                p1 -= 10;
                page--;
            } else if (i.customId === 'next') {
                if (page + 1 > maxPage) return;
                p0 += 10;
                p1 += 10;
                page++;
            }

            const updatedEmbed = new EmbedBuilder()
                .setTitle('Whitelist')
                .setColor(db.color)
                .addFields(
                    { name: "Membres", value: whitelists.length === 0 ? "Aucun utilisateur" : whitelists.map((m, i) => `\`${i+1}\` - <@${m}>`).slice(p0, p1).join('\n'), inline: true },
                    { name: "Rôles", value: roles.length === 0 ? "Aucun rôle" : roles.map((m, i) => `\`${i+1}\` - <@&${m}>`).slice(p0, p1).join('\n'), inline: true }
                );

            msg.edit({ embeds: [ updatedEmbed ] }).catch(() => null);
        });
    },
};