const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

async function ask(message, question) {
    const prompt = await message.channel.send(question);
    const collected = await message.channel.awaitMessages({
        filter: response => response.author.id === message.author.id,
        max: 1,
        time: 300000
    }).catch(() => null);
    prompt.delete().catch(() => null);
    const response = collected?.first();
    response?.delete().catch(() => null);
    return response?.content?.trim() || null;
}

async function profileMenu(client, message, scope) {
    const guildMember = message.guild.members.me || await message.guild.members.fetch(client.user.id).catch(() => null);
    const draft = { name: null, avatar: null, banner: null, bio: null };

    const getState = () => scope === 'server'
        ? {
            name: guildMember?.displayName || client.user.username,
            avatar: guildMember?.displayAvatarURL({ size: 256 }) || null,
            banner: guildMember?.bannerURL?.({ size: 256 }) || null,
            bio: null
        }
        : {
            name: client.user.username,
            avatar: client.user.displayAvatarURL({ size: 256 }),
            banner: client.user.bannerURL({ size: 256 }),
            bio: null
        };

    const render = () => {
        const state = getState();
        const embed = new EmbedBuilder()
            .setTitle(state.name)
            .setColor(client.get(message.guildId).color)
            .addFields(
                { name: 'Nom', value: `\`${draft.name || state.name}\``, inline: true },
                { name: 'Photo de profil', value: draft.avatar || state.avatar ? 'Configurée' : 'Aucune', inline: true },
                { name: 'Bannière', value: draft.banner || state.banner ? 'Configurée' : 'Aucune', inline: true },
                { name: 'Bio', value: draft.bio || 'Aucune modification', inline: false }
            );
        if (draft.avatar || state.avatar) embed.setThumbnail(draft.avatar || state.avatar);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`profile_name_${scope}`).setLabel('Modifier le nom').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`profile_avatar_${scope}`).setLabel('Modifier la photo de profil').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`profile_banner_${scope}`).setLabel('Modifier la bannière').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`profile_bio_${scope}`).setLabel('Modifier la bio').setStyle(ButtonStyle.Secondary)
        );
        const saveRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`profile_save_${scope}`).setLabel('Enregistrer les modifications').setStyle(ButtonStyle.Success)
        );
        return { embeds: [embed], components: [row, saveRow] };
    };

    const msg = await message.channel.send(render());
    const collector = msg.createMessageComponentCollector({ time: 10 * 60 * 1000 });
    collector.on('end', () => msg.edit({ components: [] }).catch(() => null));
    collector.on('collect', async interaction => {
        if (interaction.user.id !== message.author.id) {
            return interaction.reply({ content: 'Vous ne pouvez pas utiliser ce menu', flags: 64 });
        }
        await interaction.deferUpdate().catch(() => null);
        const action = interaction.customId.split('_')[1];
        if (action === 'save') {
            try {
                if (scope === 'server') {
                    if (!guildMember) throw new Error('Membre introuvable');
                    await guildMember.editMe({
                        ...(draft.name ? { nick: draft.name } : {}),
                        ...(draft.avatar ? { avatar: draft.avatar } : {}),
                        ...(draft.banner ? { banner: draft.banner } : {}),
                        ...(draft.bio !== null ? { bio: draft.bio } : {})
                    });
                } else {
                    if (draft.name) await client.user.setUsername(draft.name);
                    if (draft.avatar) await client.user.setAvatar(draft.avatar);
                    if (draft.banner) await client.user.setBanner(draft.banner);
                }
                await msg.edit({ content: 'Modifications enregistrées.', embeds: [], components: [] });
                return collector.stop();
            } catch {
                return message.channel.send('Impossible d’enregistrer les modifications. Vérifiez les permissions et les limites Discord.');
            }
        }

        if (action === 'name') draft.name = await ask(message, 'Envoyez le nouveau nom');
        if (action === 'avatar') draft.avatar = await ask(message, 'Envoyez la nouvelle photo de profil (lien ou image)');
        if (action === 'banner') draft.banner = await ask(message, 'Envoyez la nouvelle bannière (lien ou image)');
        if (action === 'bio') {
            if (scope !== 'server') return message.channel.send('La bio est uniquement modifiable avec `+set server profil`');
            draft.bio = await ask(message, 'Envoyez la nouvelle bio');
        }
        await msg.edit(render()).catch(() => null);
    });
}

module.exports = { profileMenu };
