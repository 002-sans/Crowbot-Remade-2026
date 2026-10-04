const { Client, Message, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "messageCreate",
    /**
     * @param {Client} client
     * @param {Message} message
    */
    async execute(client, message) {
        if (!message.inGuild() || message.author.bot) return;
        const db = client.get(message.guildId);
        const dbPrefix = db.prefix ?? client.config.prefix ?? '+';

        if (message.content === `<@${client.user.id}>`){
            const embed = new EmbedBuilder()
                .setColor(db.color)
                .setDescription(`Mon prefix sur le serveur est \`${dbPrefix}\``)

            return message.channel.send({ embeds: [ embed ] });
        }

        if (!message.content.startsWith(dbPrefix)) return;

        const input = message.content.slice(dbPrefix.length).trim();
        let args = input.split(/ +/);
        let commandName = args.shift().toLowerCase();
        let command = client.commands.get(commandName)
            || client.commands.find(command => command.aliases && command.aliases?.includes(commandName));

        if (db.aliases) {
            const aliases = Object.entries(db.aliases)
                .flatMap(([cmdName, values]) => (values || []).map(alias => ({ cmdName, alias: alias.toLowerCase() })))
                .sort((a, b) => b.alias.split(/ +/).length - a.alias.split(/ +/).length);
            const matched = aliases.find(entry => input.toLowerCase() === entry.alias || input.toLowerCase().startsWith(`${entry.alias} `));
            if (matched) {
                command = client.commands.get(matched.cmdName);
                const aliasParts = matched.alias.split(/ +/).length;
                args = input.split(/ +/).slice(aliasParts);
                commandName = matched.cmdName;
            }
        }

        if (!command) {
            if (db.customs && db.customs[commandName]) {
                const custom = db.customs[commandName];
                if (custom.triggerByMessage === false) return;

                custom.cooldown ??= { user: 0, global: 0 };
                custom.cooldownState ??= { user: {}, global: 0 };
                const now = Date.now();
                const userUntil = custom.cooldownState.user[message.author.id] || 0;
                if (custom.cooldown.global && custom.cooldownState.global > now) {
                    return message.channel.send(`Cette commande est en cooldown global, réessayez dans ${Math.ceil((custom.cooldownState.global - now) / 1000)}s`);
                }
                if (custom.cooldown.user && userUntil > now) {
                    return message.channel.send(`Vous devez attendre ${Math.ceil((userUntil - now) / 1000)}s avant de réutiliser cette commande`);
                }
                if (custom.cooldown.global) custom.cooldownState.global = now + custom.cooldown.global;
                if (custom.cooldown.user) custom.cooldownState.user[message.author.id] = now + custom.cooldown.user;
                client.save(message.guildId);

                if (custom.deleteCommand) {
                    message.delete().catch(() => null);
                }

                const target = custom.targetMember ? (message.mentions.members.first() || message.member) : message.member;
                for (const roleId of custom.rolesAdd || []) {
                    const role = message.guild.roles.cache.get(roleId);
                    if (role?.editable && target) await target.roles.add(role, `Commande custom ${commandName}`).catch(() => null);
                }
                for (const roleId of custom.rolesRemove || []) {
                    const role = message.guild.roles.cache.get(roleId);
                    if (role?.editable && target) await target.roles.remove(role, `Commande custom ${commandName}`).catch(() => null);
                }

                for (const emoji of custom.reactions?.command || []) message.react(emoji).catch(() => null);

                let targetChannel = message.channel;
                if (custom.channelMode === 1) {
                    targetChannel = message.author;
                } else if (custom.channelMode === 2 && custom.fixedChannel) {
                    targetChannel = message.guild.channels.cache.get(custom.fixedChannel) || message.channel;
                }

                let response = null;

                if (Array.isArray(custom.advancedComponents) && custom.advancedComponents.length > 0) {
                    const { ContainerBuilder, SectionBuilder, TextDisplayBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
                    const colorInt = typeof db.color === 'string' ? parseInt(db.color.replace('#', ''), 16) || 0xff0000 : (db.color || 0xff0000);
                    const container = new ContainerBuilder().setAccentColor(colorInt);

                    for (const item of custom.advancedComponents) {
                        if (item.type === "TextDisplay") {
                            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(item.content || ""));
                        } else if (item.type === "Section") {
                            const sec = new SectionBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(item.text || ""));
                            if (item.accessoryType === "thumbnail") {
                                sec.setThumbnailAccessory({ url: item.thumbnailUrl || "https://i.imgur.com/Flu4agn.png" });
                            } else {
                                sec.setButtonAccessory(new ButtonBuilder().setCustomId("custom_exec_btn").setStyle(ButtonStyle.Secondary).setLabel(item.btnLabel || "Bouton"));
                            }
                            container.addSectionComponents(sec);
                        }
                    }

                    response = await targetChannel.send({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => null);
                } else {
                    const modules = [
                        ...(custom.messages || (custom.content ? [custom.content] : [])).map(content => ({ type: 'message', content })),
                        ...(custom.embeds || []).map(embed => ({ type: 'embed', embed })),
                        // Un sticker est enregistré avec son nom depuis la refonte de +custom ;
                        // les anciennes commandes n'ont que son identifiant.
                        ...(custom.stickers || []).map(sticker => ({ type: 'sticker', sticker: sticker?.id ?? sticker }))
                    ];
                    const selected = modules[Math.floor(Math.random() * modules.length)];
                    if (selected) {
                        if (selected.type === 'message') {
                            response = await targetChannel.send({ content: selected.content }).catch(() => null);
                        } else if (selected.type === 'embed') {
                            const em = new EmbedBuilder();
                            if (selected.embed.title) em.setTitle(selected.embed.title);
                            if (selected.embed.description) em.setDescription(selected.embed.description);
                            if (selected.embed.color) em.setColor(typeof selected.embed.color === 'string' ? parseInt(selected.embed.color.replace('#', ''), 16) || 0xff0000 : selected.embed.color);
                            if (selected.embed.image?.url) em.setImage(selected.embed.image.url);
                            response = await targetChannel.send({ embeds: [em] }).catch(() => null);
                        } else if (selected.type === 'sticker' && selected.sticker) {
                            response = await targetChannel.send({ stickers: [selected.sticker] }).catch(() => null);
                        }
                    }
                }

                if (response) {
                    for (const emoji of custom.reactions?.response || []) response.react(emoji).catch(() => null);

                    if (custom.deleteResponse && custom.deleteResponse !== "off") {
                        const ms = require('ms');
                        const delMs = ms(custom.deleteResponse);
                        if (delMs) {
                            setTimeout(() => response.delete().catch(() => null), delMs);
                        }
                    }
                }

                if (custom.logChannel) {
                    const logChan = message.guild.channels.cache.get(custom.logChannel);
                    if (logChan) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle("Commande custom exécutée")
                            .setColor(typeof db.color === 'string' ? parseInt(db.color.replace('#', ''), 16) || 0xff0000 : 0xff0000)
                            .setDescription(`La commande **${commandName}** a été exécutée par ${message.author} (<@${message.author.id}>)`)
                            .setTimestamp();
                        logChan.send({ embeds: [logEmbed] }).catch(() => null);
                    }
                }

                return response;
            }
            return;
        }

        if (command.botBuyerOnly && !client.isBuyer(message.author.id)) return;
        if (command.botOwnerOnly && !client.isBotOwner(message.author.id)) return;
        if (command.guildOwnerOnly && message.guild.ownerId != message.author.id && !client.isBotOwner(message.author.id)) return;

        // Buyer : accès total (bypass perm / change / no)
        if (!client.isBuyer(message.author.id)) {
            if (command.perm) {
                let requiredPerm = command.perm;

                if (db.perms?.change && db.perms.change[command.name] != null) {
                    const customPerm = db.perms.change[command.name];

                    if (typeof customPerm === "string" && ["buyer", "owner"].includes(customPerm.toLowerCase())) {
                        requiredPerm = customPerm.toLowerCase();
                    } else if (typeof customPerm === "string" && customPerm.length > 10) {
                        const role = message.guild.roles.cache.get(customPerm);
                        if (!role || !message.member.roles.cache.has(role.id)) {
                            return message.channel.send(`Vous devez avoir le rôle ${role ? role : `<@&${customPerm}>`} pour utiliser cette commande.`);
                        }
                        requiredPerm = null;
                    } else {
                        requiredPerm = parseInt(customPerm, 10);
                    }
                }

                const hasSuppPerm = db.perms?.supp && (
                    (db.perms.supp[message.author.id] && db.perms.supp[message.author.id].includes(command.name)) ||
                    message.member.roles.cache.some(role => db.perms.supp[role.id] && db.perms.supp[role.id].includes(command.name))
                );

                if (requiredPerm !== null && !hasSuppPerm && !client.perm(requiredPerm, message.author.id, message.channelId, message.guild)) {
                    return;
                }
            }

            if (db.perms?.no?.includes(command.name)) return;
        }

        try {
            await command.execute(client, message, args, db);
            console.log(`[CMD] ${message.guild.name} | ${message.channel.name} | ${message.author.displayName} | ${command.name}`);
        } catch (err) {
            console.error(`[CMD-ERR] ${command.name}`, err);
            message.channel.send("Une erreur est survenue lors de l'exécution de la commande.").catch(() => null);
        }
    }
}
