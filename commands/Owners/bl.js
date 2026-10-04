const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, Client, Message } = require("discord.js");

module.exports = {
    name: "bl",
    description: "Blacklist un utilisateur du bot",
    category: "Owners",
    aliases: [ "blacklist" ],
    permissions: [],
    argument: "[user] [raison]",
    guildOwnerOnly: false,
    botOwnerOnly: false,
    perm: 8,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const bl = client.getBlacklist();
        const admins = Object.keys(bl);

        if (!args.length) {
            let p0 = 0;
            let p1 = 10;
            let page = 1;

            const embed = new EmbedBuilder()
                .setTitle('Liste des utilisateurs blacklist')
                .setColor(db.color)
                .setDescription(`${admins.length === 0 ? "Aucun blacklist" : admins
                    .map((m, i) => `\`${i+1}\` - <@${m}> (\`${bl[m].reason ?? "Aucune raison"}\`)`)
                    .slice(p0, p1).join('\n')
                }`);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('back').setLabel('◀').setStyle(2),
                new ButtonBuilder().setCustomId('next').setLabel('▶').setStyle(2)
            );

            const msg = await message.channel.send({ embeds: [ embed ], components: admins.length > p1 ? [ row ] : [] });
            const collector = msg.createMessageComponentCollector({
                filter: i => i.user.id === message.author.id,
                time: 1000 * 60 * 10
            });

            collector.on('end', () => msg.edit({ components: [] }).catch(() => null));
            collector.on('collect', async i => {
                await i.deferUpdate().catch(() => null);
                const maxPage = Math.max(1, Math.ceil(admins.length / 10));
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

                embed.setDescription(`${admins.length === 0 ? "Aucun blacklist" : admins
                    .map((m, i) => `\`${i+1}\` - <@${m}> (\`${bl[m].reason ?? "Aucune raison"}\`)`)
                    .slice(p0, p1).join('\n')
                }`);

                msg.edit({ embeds: [ embed ] }).catch(() => null);
            });
            return;
        }

        const groups = client.resolvers.splitArgumentGroups(args.join(' '), 2);
        const targetInput = groups[0] || args[0];
        const reasonInput = groups[1] || "Blacklist";

        const targets = client.cleanInput(targetInput);
        if (!targets.length && message.mentions.users.size > 0) {
            targets.push(...message.mentions.users.keys());
        }

        const addedUsers = [];

        for (const target of targets) {
            const user = client.users.cache.get(target) || await client.users.fetch(target).catch(() => null);
            if (!user) continue;
            if (bl[user.id]) continue;

            bl[user.id] = {
                date: Date.now(),
                author: message.author.id,
                reason: reasonInput
            };

            let ban = 0;
            let notban = 0;
            for (const guild of client.guilds.cache.values()) {
                try {
                    await guild.bans.create(user.id, { reason: `Blacklist: ${reasonInput}` });
                    ban++;
                } catch {
                    notban++;
                }
            }
            addedUsers.push({ user, ban, notban });
        }

        client.saveBlacklist();

        if (addedUsers.length === 0) {
            return message.channel.send(`Aucun utilisateur n'a pu être blacklist pour \`${targetInput}\``);
        }

        if (addedUsers.length === 1) {
            const { user, ban, notban } = addedUsers[0];
            return message.channel.send(`${user.displayName || user.username} a été **blacklist**\nIl a été banni de **${ban}** serveur${ban < 2 ? "" : "s"}\nIl n'a pas pu être banni de **${notban}** serveur${notban < 2 ? "" : "s"}`);
        }

        return message.channel.send(`\`${addedUsers.length}\` utilisateur(s) ont été **blacklist**`);
    },
};
