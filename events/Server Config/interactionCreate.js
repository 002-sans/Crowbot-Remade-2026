const { Client, ChatInputCommandInteraction } = require("discord.js");

module.exports = {
    name: "interactionCreate",
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(client, interaction) {
        if (!interaction.inGuild()) return;
        const db = client.get(interaction.guildId);

        if (interaction.isModalSubmit() && interaction.customId === 'captcha_modal') {
            const session = client.captchaSessions?.get(`${interaction.guildId}:${interaction.user.id}`);
            if (!session || session.expiresAt < Date.now()) {
                return interaction.reply({ content: "Cette vérification a expiré. Appuyez à nouveau sur le bouton.", flags: 64 });
            }

            const answer = interaction.fields.getTextInputValue('captcha_answer').trim().toUpperCase();
            if (answer !== session.code) {
                return interaction.reply({ content: "Mot de passe incorrect.", flags: 64 });
            }

            const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
            const captcha = db.joinsettings?.captcha;
            if (!member || !captcha) return interaction.reply({ content: "Impossible de terminer la vérification.", flags: 64 });

            if (captcha.roleId) await member.roles.remove(captcha.roleId, "Captcha validé").catch(() => null);
            if (db.joinsettings.memberRole) await member.roles.add(db.joinsettings.memberRole, "Rôle membre après captcha").catch(() => null);
            delete captcha.pending?.[member.id];
            client.save(interaction.guildId);
            client.captchaSessions.delete(`${interaction.guildId}:${interaction.user.id}`);

            const inviter = client.captchaInviters?.get(`${interaction.guildId}:${member.id}`) || null;
            client.captchaInviters?.delete(`${interaction.guildId}:${member.id}`);
            const { sendJoinWelcome } = require('../../utiles/joinWelcome');
            await sendJoinWelcome(member, db, inviter);
            return interaction.reply({ content: "Vérification réussie, bienvenue !", flags: 64 });
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith('formulaire_modal_')) {
            const formId = interaction.customId.slice('formulaire_modal_'.length);
            const form = (db.formulaires || []).find(f => f.id === formId);
            if (!form) return interaction.reply({ content: "Ce formulaire n'existe plus", flags: 64 });
            const reponse = interaction.fields.getTextInputValue('reponse');
            const logChannel = interaction.guild.channels.cache.get(form.logChannelId);
            if (logChannel) {
                const { EmbedBuilder } = require('discord.js');
                const embed = new EmbedBuilder()
                    .setTitle(form.title)
                    .setColor(db.color)
                    .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
                    .setDescription(reponse)
                    .setFooter({ text: db.footer ?? 'ζ͜͡Crow Bots' })
                    .setTimestamp();
                await logChannel.send({ embeds: [embed] }).catch(() => null);
            }
            return interaction.reply({ content: "Votre réponse a été **envoyée**", flags: 64 });
        }

        if (interaction.isButton()) {
            if (interaction.customId.startsWith('captcha_verify_')) {
                const { createCaptcha } = require('../../utiles/captcha');
                const captcha = db.joinsettings?.captcha;
                if (!captcha?.enabled) return interaction.reply({ content: "La vérification n'est plus active.", flags: 64 });

                const generated = createCaptcha();
                client.captchaSessions ??= new Map();
                client.captchaSessions.set(`${interaction.guildId}:${interaction.user.id}`, {
                    code: generated.code,
                    expiresAt: Date.now() + 120000
                });

                const { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
                const embed = new EmbedBuilder()
                    .setColor(db.color)
                    .setDescription("Vous devez passer une vérification avant d'accéder à ce serveur. Cliquez sur le bouton pour entrer le mot de passe *(toutes les lettres sont en majuscules)*")
                    .setImage(`attachment://${generated.name}`);
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('captcha_input').setLabel('Entrez un mot de passe').setStyle(ButtonStyle.Primary)
                );
                return interaction.reply({ embeds: [embed], files: [new AttachmentBuilder(generated.buffer, { name: generated.name })], components: [row], flags: 64 });
            }

            if (interaction.customId === 'captcha_input') {
                const modal = new (require('discord.js').ModalBuilder)().setCustomId('captcha_modal').setTitle('Vérification captcha');
                const input = new (require('discord.js').TextInputBuilder)()
                    .setCustomId('captcha_answer')
                    .setLabel('Mot de passe')
                    .setStyle(require('discord.js').TextInputStyle.Short)
                    .setRequired(true)
                    .setMaxLength(5);
                modal.addComponents(new (require('discord.js').ActionRowBuilder)().addComponents(input));
                return interaction.showModal(modal);
            }

            if (interaction.customId.startsWith('formulaire_')) {
                const formId = interaction.customId.slice('formulaire_'.length);
                const form = (db.formulaires || []).find(f => f.id === formId);
                if (!form) return interaction.reply({ content: "Ce formulaire n'existe plus", flags: 64 });

                const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
                const modal = new ModalBuilder()
                    .setCustomId(`formulaire_modal_${formId}`)
                    .setTitle(form.title.slice(0, 45));
                const input = new TextInputBuilder()
                    .setCustomId('reponse')
                    .setLabel('Votre réponse')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return interaction.showModal(modal);
            }

            if (interaction.customId.startsWith('rolemenu_')) {
                await interaction.deferUpdate();

                const roleId = interaction.customId.split('_')[1];
                const allRoleIds = interaction.message.components.find(c => c.components.find(c => c.customId == `rolemenu_${roleId}`)).components.map(r => r.customId.split('rolemenu_')[1])
                const rolemenuDb = db.rolemenu.find(c => c.messageId == interaction.message.id);

                const role = interaction.guild.roles.cache.get(roleId);
                if (!role) return interaction.followUp({ content: "Ce rôle n'existe plus", flags: 64 });

                if (!rolemenuDb) return interaction.followUp({ content: "Un problème a été détécté, il est impossible de recevoir ce rôle", flags: 64 });
                if (rolemenuDb.blroles.length > 0 && rolemenuDb.blroles.some(id => interaction.member.roles.cache.has(id)))
                    return interaction.followUp({ content: "Vous n'avez pas l'autorisation de recevoir ce rôle", flags: 64 });

                if (rolemenuDb.wlroles.length > 0 && !rolemenuDb.wlroles.some(id => interaction.member.roles.cache.has(id)))
                    return interaction.followUp({ content: "Vous n'avez pas l'autorisation de recevoir ce rôle", flags: 64 });

                if (rolemenuDb.type == "Donner" && interaction.member.roles.cache.has(roleId))
                    return;

                else if (rolemenuDb.type == "Donner")
                    return interaction.member.roles.add(role, "Rolemenu")

                if (rolemenuDb.type == "Retirer" && !interaction.member.roles.cache.has(roleId))
                    return;

                else if (rolemenuDb.type == "Retirer")
                    return interaction.member.roles.remove(role, "Rolemenu")

                else if (interaction.member.roles.cache.has(roleId))
                    return interaction.member.roles.remove(role, "Rolemenu");

                else interaction.member.roles.add(role, "Rolemenu")
            }

            if (interaction.customId === 'ticket_open_btn_default' || interaction.customId.startsWith('ticket_open_btn_')) {
                const optionIndex = interaction.customId.startsWith('ticket_open_btn_') && interaction.customId !== 'ticket_open_btn_default' 
                    ? Number(interaction.customId.split('_').pop()) 
                    : null;
                await handleOpenTicket(client, interaction, optionIndex);
            }

            if (interaction.customId === 'ticket_btn_close') {
                if (!interaction.channel) return;
                const isTicket = interaction.channel.name?.startsWith('ticket-');
                if (!isTicket) return interaction.reply({ content: "Ce salon n'est pas un ticket.", flags: 64 });

                await interaction.reply({ content: "Fermeture du ticket...", flags: 64 });

                const currentDb = client.get(interaction.guildId);
                if (!currentDb.tickets) currentDb.tickets = { open: [] };
                if (!currentDb.tickets.open) currentDb.tickets.open = [];
                currentDb.tickets.open = currentDb.tickets.open.filter(t => t.channelId !== interaction.channel.id);
                client.save(interaction.guildId);

                const autodelete = currentDb.tickets.autodelete !== false;
                if (autodelete) {
                    interaction.channel.delete("Ticket fermé").catch(() => {});
                } else {
                    interaction.channel.setLocked(true).catch(() => {});
                    interaction.channel.setArchived?.(true).catch(() => {});
                }
            }
            if (interaction.customId === 'ticket_btn_claim') {
                if (!interaction.member.permissions.has('ManageChannels')) return interaction.reply({ content: "Vous n'avez pas la permission de claim ce ticket.", flags: 64 });
                await interaction.reply({ content: `Ticket claim par ${interaction.member}.`, flags: 64 });
                try {
                    await interaction.channel.permissionOverwrites.edit(interaction.member.id, { ViewChannel: true, SendMessages: true });
                } catch {}
            }
        }

        else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'ticket_open_select') {
                const value = interaction.values?.[0] || null;
                let optionIndex = null;
                
                if (value && value.startsWith('option_') && value !== 'option_default') {
                    optionIndex = Number(value.split('_').pop());
                }
                
                await handleOpenTicket(client, interaction, optionIndex);
                return;
            }
            
            if (interaction.customId.startsWith('option_action_')) {
                const optionIndex = parseInt(interaction.customId.split('_').pop());
                const action = interaction.values[0];
                const db = client.get(interaction.guildId);
                
                if (!db.tickets || !db.tickets.options || !db.tickets.options[optionIndex]) {
                    return interaction.reply({ content: "Option introuvable.", flags: 64 });
                }
                
                if (action === 'edit_text') {
                    await interaction.reply({ 
                        content: "Entrez le nouveau texte pour cette option:", 
                        flags: 64 
                    });
                    
                    const filter = m => m.author.id === interaction.user.id && m.guildId === interaction.guildId;
                    
                    try {
                        const collected = await interaction.channel.awaitMessages({ 
                            filter, 
                            max: 1, 
                            time: 30000, 
                            errors: ['time'] 
                        });
                        
                        const response = collected.first();
                        db.tickets.options[optionIndex].texte = response.content.trim();
                        client.save(interaction.guildId);
                        
                        await interaction.followUp({ 
                            content: `Texte modifié : "${response.content.trim()}"`, 
                            flags: 64 
                        });
                        
                        if (response.deletable) await response.delete().catch(() => {});
                        
                    } catch (error) {
                        await interaction.followUp({ 
                            content: "Temps écoulé, le texte n'a pas été modifié.", 
                            flags: 64 
                        });
                    }
                } else if (action === 'edit_emoji') {
                    await interaction.reply({ 
                        content: "Entrez le nouvel emoji pour cette option (ou 'none' pour supprimer):", 
                        flags: 64 
                    });
                    
                    const filter = m => m.author.id === interaction.user.id && m.guildId === interaction.guildId;
                    
                    try {
                        const collected = await interaction.channel.awaitMessages({ 
                            filter, 
                            max: 1, 
                            time: 30000, 
                            errors: ['time'] 
                        });
                        
                        const response = collected.first();
                        const newEmoji = response.content.trim().toLowerCase() === 'none' ? null : response.content.trim();
                        db.tickets.options[optionIndex].emoji = newEmoji;
                        client.save(interaction.guildId);
                        
                        await interaction.followUp({ 
                            content: `Emoji modifié : ${newEmoji || 'supprimé'}`, 
                            flags: 64 
                        });
                        
                        if (response.deletable) await response.delete().catch(() => {});
                        
                    } catch (error) {
                        await interaction.followUp({ 
                            content: "Temps écoulé, l'emoji n'a pas été modifié.", 
                            flags: 64 
                        });
                    }
                } else if (action === 'edit_staff_role') {
                    await interaction.reply({ 
                        content: "Entrez l'ID du nouveau rôle staff pour cette option (ou 'none' pour supprimer):", 
                        flags: 64 
                    });
                    
                    const filter = m => m.author.id === interaction.user.id && m.guildId === interaction.guildId;
                    
                    try {
                        const collected = await interaction.channel.awaitMessages({ 
                            filter, 
                            max: 1, 
                            time: 30000, 
                            errors: ['time'] 
                        });
                        
                        const response = collected.first();
                        const roleInput = response.content.trim();
                        
                        if (roleInput.toLowerCase() === 'none') {
                            db.tickets.options[optionIndex].staffRole = null;
                            await interaction.followUp({ 
                                content: "Rôle staff supprimé de cette option.", 
                                flags: 64 
                            });
                        } else {
                            const role = interaction.guild.roles.cache.get(roleInput) || 
                                       await interaction.guild.roles.fetch(roleInput).catch(() => null);
                            
                            if (role) {
                                db.tickets.options[optionIndex].staffRole = role.id;
                                await interaction.followUp({ 
                                    content: `Rôle staff modifié : ${role}`, 
                                    flags: 64 
                                });
                            } else {
                                await interaction.followUp({ 
                                    content: "Rôle introuvable. Le rôle staff n'a pas été modifié.", 
                                    flags: 64 
                                });
                            }
                        }
                        
                        client.save(interaction.guildId);
                        
                        if (response.deletable) await response.delete().catch(() => {});
                        
                    } catch (error) {
                        await interaction.followUp({ 
                            content: "Temps écoulé, le rôle staff n'a pas été modifié.", 
                            flags: 64 
                        });
                    }
                } else if (action === 'delete') {
                    const deletedOption = db.tickets.options[optionIndex];
                    db.tickets.options.splice(optionIndex, 1);
                    client.save(interaction.guildId);
                    
                    await interaction.reply({ 
                        content: `Option supprimée : "${deletedOption.texte}"`, 
                        flags: 64 
                    });
                }
                return;
            }
            
            if (interaction.customId !== 'rolemenu') return;
            await interaction.deferUpdate();

            const allRoleIds = interaction.message.components
                .find(c => c.components.find(c => c.customId == "rolemenu"))
                .components.flatMap(data => data.options.map(o => o.value));

            const roles = allRoleIds.map(r => interaction.guild.roles.cache.get(r));
            const addRole = roles.filter(r => interaction.values.includes(r.id))
            const delRole = roles.filter(r => !interaction.values.includes(r.id))

            if (roles.length == 0) return interaction.followUp({ content: "Ces rôles n'existent plus", flags: 64 });

            const rolemenuDb = db.rolemenu.find(c => c.messageId == interaction.message.id);

            if (!rolemenuDb) return interaction.followUp({ content: "Un problème a été détécté, il est impossible de recevoir ce rôle", flags: 64 });
            if (rolemenuDb.blroles.length > 0 && rolemenuDb.blroles.some(id => interaction.member.roles.cache.has(id)))
                return interaction.followUp({ content: "Vous n'avez pas l'autorisation de recevoir ce rôle", flags: 64 });

            if (rolemenuDb.wlroles.length > 0 && !rolemenuDb.wlroles.some(id => interaction.member.roles.cache.has(id)))
                return interaction.followUp({ content: "Vous n'avez pas l'autorisation de recevoir ce rôle", flags: 64 });

            if (rolemenuDb.type == "Retirer" && delRole.length > 0)
                return interaction.member.roles.remove(addRole, "Rolemenu");

            if (rolemenuDb.type == "Donner" && addRole.length > 0)
                return interaction.member.roles.add(addRole, "Rolemenu")

            if (rolemenuDb.type == "Donner/Retirer") {
                if (addRole.length > 0) addRole.forEach(role => interaction.member.roles.add(role, "Rolemenu"));
                if (delRole.length > 0) delRole.forEach(role => interaction.member.roles.remove(role, "Rolemenu"));
            }
        }
    }
}

async function handleOpenTicket(client, interaction, optionIndex) {
    const db = client.get(interaction.guildId);
    if (!db.tickets) {
        db.tickets = {
            panelChannelId: null,
            message: null,
            type: 'buttons',
            claim: false,
            autoclaim: false,
            autodelete: true,
            maxPerUser: 1,
            leave: false,
            afk: false,
            claim_button: false,
            close_button: true,
            transcripts: false,
            roles_req: [],
            roles_ban: [],
            supportRoles: [],
            options: [],
            open: []
        };
        client.save(interaction.guildId);
    }

    const options = db.tickets.options || [];
    const maxPerUser = Number(db.tickets.maxPerUser || 1);
    if (!db.tickets.open) db.tickets.open = [];

    const userOpenTickets = db.tickets.open.filter(t => t.userId === interaction.user.id);
    if (userOpenTickets.length >= maxPerUser) {
        return interaction.reply({ content: `Vous avez déjà ${maxPerUser} ticket(s) ouvert(s).`, flags: 64 });
    }

    const baseName = `ticket-${interaction.user.username}`.slice(0, 90);
    const parentId = interaction.channel?.parentId ?? null;

    const everyone = interaction.guild.roles.everyone;
    const permissionOverwrites = [
        { id: everyone.id, deny: ['ViewChannel'] },
        { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks'] },
        { id: interaction.client.user.id, allow: ['ViewChannel', 'SendMessages', 'ManageChannels', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks'] }
    ];

    if (optionIndex !== null && optionIndex !== undefined && options[optionIndex] && options[optionIndex].staffRole) {
        const staffRole = interaction.guild.roles.cache.get(options[optionIndex].staffRole);
        if (staffRole) {
            permissionOverwrites.push({
                id: staffRole.id,
                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'AttachFiles', 'EmbedLinks']
            });
        }
    }

    const created = await interaction.guild.channels.create({
        name: baseName,
        parent: parentId ?? undefined,
        type: 0,
        permissionOverwrites
    }).catch(() => null);

    if (!created) return interaction.reply({ content: "Impossible de créer le ticket.", flags: 64 });

    db.tickets.open.push({ userId: interaction.user.id, channelId: created.id });
    client.save(interaction.guildId);

    const embed = new (require('discord.js').EmbedBuilder)()
        .setTitle('Ticket ouvert')
        .setColor(Number(`0x${db.color || 'FFFFFF'}`))
        .setDescription(`Bonjour ${interaction.user}, un membre du staff va vous prendre en charge.`);

    if (optionIndex !== null && optionIndex !== undefined && options[optionIndex]) {
        embed.addFields({ name: 'Motif', value: options[optionIndex].texte });
    }

    const row = new (require('discord.js').ActionRowBuilder)().addComponents(
        new (require('discord.js').ButtonBuilder)().setCustomId('ticket_btn_close').setLabel('Fermer').setStyle(4),
        new (require('discord.js').ButtonBuilder)().setCustomId('ticket_btn_claim').setLabel('Claim').setStyle(2)
    );

    await created.send({ content: `${interaction.user}`, embeds: [embed], components: [row] }).catch(() => {});
    return interaction.reply({ content: `Ticket créé: ${created}`, flags: 64 });
}
