const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'alias',
    description: 'Gère les alias des commandes',
    category: 'Bot Control',
    argument: '<commande>',
    aliases: [],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: true,
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        db.aliases ??= {};
        const commandName = args.join(' ').trim();
        const command = client.commands.get(commandName) || client.commands.find(c => c.aliases?.includes(commandName));
        if (!command) return message.channel.send(`Aucune commande de trouvée pour \`${commandName || 'rien'}\``);

        const render = () => {
            const aliases = db.aliases[command.name] || [];
            const embed = new EmbedBuilder()
                .setTitle(command.name)
                .setDescription(aliases.length ? aliases.map(alias => `- ${alias}`).join('\n') : 'Aucun alias')
                .setColor(db.color);
            const components = [new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('alias_add').setLabel('Ajouter un alias').setStyle(ButtonStyle.Secondary)
            )];
            if (aliases.length) components.push(new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder().setCustomId('alias_delete').setPlaceholder('Supprimer un alias')
                    .setMinValues(1).setMaxValues(1)
                    .addOptions(aliases.slice(0, 25).map(alias => ({ label: alias.slice(0, 100), value: alias })))
            ));
            return { embeds: [embed], components };
        };

        const msg = await message.channel.send(render());
        const collector = msg.createMessageComponentCollector({ time: 10 * 60 * 1000 });
        collector.on('end', () => msg.edit({ components: [] }).catch(() => null));
        collector.on('collect', async interaction => {
            if (interaction.user.id !== message.author.id) return interaction.reply({ content: 'Vous ne pouvez pas utiliser ce menu', flags: 64 });
            await interaction.deferUpdate().catch(() => null);
            const aliases = db.aliases[command.name] || (db.aliases[command.name] = []);

            if (interaction.customId === 'alias_add') {
                const question = await message.channel.send(`Quel est le nouvel alias pour la commande \`${command.name}\``);
                const collected = await message.channel.awaitMessages({ filter: m => m.author.id === message.author.id, max: 1, time: 300000 }).catch(() => null);
                question.delete().catch(() => null);
                const response = collected?.first();
                response?.delete().catch(() => null);
                const alias = response?.content?.trim().toLowerCase();
                if (alias && !aliases.includes(alias) && !client.commands.has(alias)) aliases.push(alias);
                client.save(message.guildId);
                return msg.edit(render()).catch(() => null);
            }

            if (interaction.customId === 'alias_delete') {
                const alias = interaction.values[0];
                db.aliases[command.name] = aliases.filter(value => value !== alias);
                client.save(message.guildId);
                await interaction.followUp({ content: `Alias supprimé: ${alias || 'rien'}.`, flags: 64 }).catch(() => null);
                return msg.edit(render()).catch(() => null);
            }
        });
    }
};
