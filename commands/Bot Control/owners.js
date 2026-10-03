const { Client, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");

module.exports = {
    name: "owners",
    description: "Affiche al liste des owners",
    category: "Owners",
    aliases: [],
    permissions: [],
    argument: "[user]",
    guildOwnerOnly: false,
    botOwnerOnly: true,
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {string[]} args
    */
    async execute(client, message, args) {
        const db = client.get(message.guildId);

        let p0 = 0;
        let p1 = 10;
        let page = 1;

        const embed = new EmbedBuilder()
            .setTitle('Liste des owners')
            .setColor(db.color)
            .setDescription(`${client.config.owners.length == 0 ? "Aucun owners" : client.config.owners
                .map(r => r)
                .map((m, i) => `\`${i + 1}\` - <@${m}>`)
                .slice(p0, p1).join('\n')
                }`)

        const row = new ActionRowBuilder(
            new ButtonBuilder()
                .setCustomId('back')
                .setLabel('◀')
                .setStyle(2),

            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('▶')
                .setStyle(2),
        );

        const msg = await message.channel.send({ embeds: [embed], components: client.config.owners.length > p1 ? [row] : null })
        const filter = i => { i.deferUpdate(); return i.user.id === message.author.id }
        const collector = msg.createMessageComponentCollector({ filter, time: 1000 * 60 * 10 });

        collector.on('end', () => msg.edit({ components: [] }));
        collector.on('collect', async i => {
            switch (i.customId) {
                case 'back':
                    if (page - 1 < 1) return;

                    p0 = p0 - 10;
                    p1 = p1 - 10;
                    page = page - 1

                    embed.setDescription(`${client.config.owners
                        .map(r => r)
                        .map((m, i) => `\`${i + 1}\` - <@${m}>`)
                        .slice(p0, p1).join('\n')
                        }`)

                    msg.edit({ embeds: [embed] });
                    break;

                case 'next':
                    if (page + 1 > Math.ceil(client.config.owners.length / 10)) return;

                    p0 = p0 + 10;
                    p1 = p1 + 10;
                    page++;

                    embed.setDescription(`${client.config.owners
                        .map(r => r)
                        .map((m, i) => `\`${i + 1}\` - <@${m}>`)
                        .slice(p0, p1).join('\n')
                        }`)

                    msg.edit({ embeds: [embed] });
                    break;
            }
        })

    }
}