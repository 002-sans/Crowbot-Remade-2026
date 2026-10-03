const { EmbedBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
    name: "help",
    description: "Afficher la liste des commandes du bot.",
    category: "Utilitaire",
    aliases: ["aide"],
    permissions: [],
    perm: 1,
    guildOwnerOnly: false,
    botOwnerOnly: false,
    async execute(client, message, args) {
        const db = client.get(message.guildId);
        const prefix = db.prefix ?? client.config.prefix ?? '+';
        const color = db.color ? parseInt(db.color.replace('#', ''), 16) : 0xFF0000;
        const footerText = `${db.footer ?? 'ζ͜͡Crow Bots'} • Préfixe actuel : ${prefix}`;

        // 1. Modération
        const moderation = new EmbedBuilder()
            .setTitle('Modération')
            .setColor(color)
            .setFooter({ text: footerText })
            .setDescription(`*Les paramètres peuvent être des noms, des mentions, ou des IDs\nSi ce ne sont pas des mentions ils doivent être séparés par \`,,\`*\n\n**\`${prefix}sanctions <membre>\`**\nAffiche les sanctions reçues par un membre\n\n**\`${prefix}del sanction <membre> <nombre>\`**\nSupprime une sanction pour un membre\n\n**\`${prefix}clear sanctions <membre>\`**\nSupprime toutes les sanctions d'un membre\n\n**\`${prefix}clear all sanctions\`**\nSupprime toutes les sanctions de tous les membres du serveur\n\n**\`${prefix}clear [nombre] [membre]\`**\nSupprime le nombre de messages donnés dans le salon actuel. Si un membre est précisé, seul ses messages sont supprimés\n\n**\`${prefix}note <membre> [raison]\`**\nAjoute une note de modération à un membre ou consulte ses notes\n\n**\`${prefix}note delete [membre] <nombre/all>\`**\nSupprime une note ou toutes les notes d'un membre, ou toutes les notes du serveur\n\n**\`${prefix}warn <membre> [raison]\`**\nDonne un warn à un ou plusieurs membres, une raison peut être précisée\n\n**\`${prefix}mute <membre> [raison]\`**\nMute un ou plusieurs membres, une raison peut être précisée\n\n**\`${prefix}tempmute <membre> <durée> [raison]\`**\nMute un ou plusieurs membres pour une durée déterminée, une raison peut être précisée\n\n**\`${prefix}unmute <membre>\`**\nMet fin au mute d'un ou plusieurs membres\n\n**\`${prefix}cmute <membre> [raison]\`**\nMute un ou plusieurs membres sur le salon actuel, une raison peut être précisée\n\n**\`${prefix}tempcmute <membre> <durée> [raison]\`**\nMute un ou plusieurs membres pour une durée déterminée sur le salon actuel, une raison peut être précisée\n\n**\`${prefix}uncmute <membre>\`**\nMet fin au cmute d'un ou plusieurs membres\n\n**\`${prefix}mutelist\`**\nAffiche la liste de tous les mutes en cours sur le serveur\n\n**\`${prefix}unmuteall\`**\nSupprime tous les mutes en cours\n\n**\`${prefix}kick <membre> [raison]\`**\nExpulse un ou plusieurs membres du serveur, une raison peut être précisée\n\n**\`${prefix}ban <membre> [raison]\`**\nBannit un ou plusieurs membres du serveur, une raison peut être précisée\n\n**\`${prefix}tempban <membre> <durée> [raison]\`**\nBannit un ou plusieurs membres du serveur pour une durée déterminée, une raison peut être précisée\n\n**\`${prefix}unban <membre>\`**\nEnlève le ban d'un ou plusieurs membres sur le serveur\n\n**\`${prefix}banlist\`**\nAffiche la liste des bannissements en cours sur le serveur\n\n**\`${prefix}lock/unlock [salon]\`**\nFerme ou ouvre complètement un salon textuel ou vocal\n\n**\`${prefix}lockall/unlockall\`**\nFerme ou réouvre tous les salons du serveur\n\n**\`${prefix}hide/unhide [salon]\`**\nCache ou affiche un salon textuel ou vocal\n\n**\`${prefix}hideall/unhideall\`**\nCache ou affiche tous les salons du serveur\n\n**\`${prefix}addrole <membre> <rôle>\`**\nAjoute le ou les rôles souhaités à la ou les personnes souhaitées\n\n**\`${prefix}delrole <membre> <rôle>\`**\nSupprime le ou les rôles souhaités de la ou des personnes souhaités\n\n**\`${prefix}derank <membre>\`**\nSupprime tous les rôles d'un ou plusieurs membres\n\n**\`${prefix}nick <membre> <nom>\`**\nChange le pseudo d'un membre sur le serveur\n\n**\`${prefix}lockname <membre> <nom>\`**\nVerrouille le pseudo d'un membre\n\n**\`${prefix}unlockname <membre>\`**\nDéverouille le pseudo d'un membre\n\n**\`${prefix}locknamelist\`**\nAffiche la liste des membres ayant un pseudo verrouillé`);

        // 2. Paramètres de modération
        const modpara = new EmbedBuilder()
            .setTitle('Paramètres de modération')
            .setColor(color)
            .setFooter({ text: footerText })
            .setDescription(`*Les paramètres peuvent être des noms, des mentions, ou des IDs\nSi ce ne sont pas des mentions ils doivent être séparés par \`,\`*\n\n**\`${prefix}ancien <temps>\`**\nPermet d'expulser les comptes créés il y a moins d'un certain temps\n\n**\`${prefix}autothread <add/del> [salon]\`**\nPermet d'ajouter ou de supprimer des salons où un thread sera créé à chaque message\n\n**\`${prefix}badword <add/del/list> [mot]\`**\nPermet d'ajouter ou de supprimer des mots interdits\n\n**\`${prefix}link <allow/deny> <lien/type>\`**\nPermet d'autoriser ou d'interdire un lien ou un type de lien\n\n**\`${prefix}modlog settings\`**\nPermet de configurer les salons où seront envoyés les logs de modération\n\n**\`${prefix}muterole [rôle]\`**\nPermet de définir le rôle de mute\n\n**\`${prefix}noderank <add/del/list> <rôle>\`**\nPermet d'ajouter ou de supprimer des rôles qui ne peuvent pas être derank\n\n**\`${prefix}piconly <add/del> [salon]\`**\nPermet d'ajouter ou de supprimer des salons où seules les images sont autorisées\n\n**\`${prefix}public <on/off>\`**\nPermet d'activer ou de désactiver les commandes publiques\n\n**\`${prefix}settings\`**\nAffiche les paramètres du serveur\n\n**\`${prefix}spam <nombre> [temps]\`**\nPermet de définir le nombre de messages envoyés dans un certain temps avant d'être considéré comme du spam\n\n**\`${prefix}strikes <nombre> [punition]\`**\nPermet de définir le nombre d'avertissements avant d'appliquer une punition\n\n**\`${prefix}timeout <durée>\`**\nPermet de définir la durée maximale d'un timeout`);

        // 3. Logs
        const logs = new EmbedBuilder()
            .setTitle('Logs')
            .setColor(color)
            .setFooter({ text: footerText })
            .setDescription(`*Les paramètres peuvent être des noms, des mentions, ou des IDs\nSi ce ne sont pas des mentions ils doivent être séparés par \`,,\`*\n\n**\`${prefix}modlog on [salon]\`**\nActive les logs de modération dans un salon\n\n**\`${prefix}modlog off\`**\nDésactive les logs de modération\n\n**\`${prefix}messagelog on [salon]\`**\nActive les logs des messages supprimés et édités dans un salon\n\n**\`${prefix}messagelog off\`**\nDésactive les logs de messages supprimés et édités\n\n**\`${prefix}voicelog on [salon]\`**\nActive les logs de l'activité vocale dans un salon\n\n**\`${prefix}voicelog off\`**\nDésactive les logs de l'activité vocale\n\n**\`${prefix}boostlog on [salon]\`**\nActive les logs de boosts dans un salon\n\n**\`${prefix}boostlog off\`**\nDésactive les logs de boosts\n\n**\`${prefix}rolelog on [salon]\`**\nActive les logs des rôles dans un salon\n\n**\`${prefix}rolelog off\`**\nDésactive les logs des rôles\n\n**\`${prefix}raidlog on [salon]\`**\nActive les logs de l'antiraid dans un salon\n\n**\`${prefix}raidlog off\`**\nDésactive les logs de l'antiraid\n\n**\`${prefix}autoconfiglog\`**\nCrée automatiquement un salon pour chaque type de logs\n\n**\`${prefix}boostembed\`**\nConfigure l'embed de boost`);

        // 4. Configuration du serveur
        const configEmbed = new EmbedBuilder()
            .setTitle('Configuration du serveur')
            .setColor(color)
            .setFooter({ text: footerText })
            .setDescription(`*Les paramètres peuvent être des noms, des mentions, ou des IDs\nSi ce ne sont pas des mentions ils doivent être séparés par \`,\`*\n\n**\`${prefix}autopublish <on/off>\`**\nPermet de publier automatiquement les messages postés dans un salon d'annonce\n\n**\`${prefix}counters\`**\nAffiche un menu interactif pour gérer les compteurs sur le serveur\n\n**\`${prefix}del perm <niveau> <commande|/[@role/@membre]>\`**\nPermet de supprimer une permission temporaire\n\n**\`${prefix}join settings\`**\nAffiche un menu interactif pour paramétrer les arrivées\n\n**\`${prefix}leave settings\`**\nAffiche un menu interactif pour paramétrer les départs\n\n**\`${prefix}limit <limite>\`**\nPermet de modifier la limite du vocal temporaire\n\n**\`${prefix}open\`**\nPermet d'ouvrir le vocal temporaire\n\n**\`${prefix}private\`**\nPermet de rendre privé le vocal temporaire\n\n**\`${prefix}rename <nom>\`**\nPermet de renommer le vocal temporaire\n\n**\`${prefix}rolemenu\`**\nAffiche un menu interactif pour créer ou modifier un menu de rôles\n\n**\`${prefix}set <visible/invisible>\`**\nPermet de modifier la visibilité du vocal temporaire\n\n**\`${prefix}soutien\`**\nPermet de récompenser les personnes qui soutiennent le serveur\n\n**\`${prefix}suggestion\`**\nPermet de configurer le système de suggestions\n\n**\`${prefix}tempvoc\`**\nAffiche un menu interactif pour gérer les vocaux temporaires sur le serveur\n\n**\`${prefix}ticket\`**\nAffiche un menu permettant de gérer le système de ticket\n\n**\`${prefix}twitch\`**\nPermet de régler des alertes lorsque des membres du serveur sont en live sur Twitch\n\n**\`${prefix}variables\`**\nAffiche la liste des variables disponibles\n\n**\`${prefix}voicekick <membre>\`**\nPermet d'expulser un membre du vocal temporaire`);

        // 5. Gestion du serveur
        const gestion = new EmbedBuilder()
            .setTitle('Gestion du serveur')
            .setColor(color)
            .setFooter({ text: footerText })
            .setDescription(`*Les paramètres peuvent être des noms, des mentions, ou des IDs\nSi ce ne sont pas des mentions ils doivent être séparés par \`,,\`*\n\n**\`${prefix}giveaway\`**\nGère les giveaways\n\n**\`${prefix}reroll\`**\nTire un nouveau gagnant au giveaway\n\n**\`${prefix}embed\`**\nCrée et envoie un embed personnalisé\n\n**\`${prefix}backup\`**\nGère les sauvegardes du serveur\n\n**\`${prefix}massiverole\`**\nAjoute un rôle à tous les membres\n\n**\`${prefix}unmassiverole\`**\nRetire un rôle à tous les membres\n\n**\`${prefix}voicemove <salon>\`**\nDéplace tous les membres vocaux\n\n**\`${prefix}voicekick\`**\nDéconnecte tous les membres vocaux\n\n**\`${prefix}cleanup\`**\nNettoie le salon\n\n**\`${prefix}bringall\`**\nAmène tous les membres dans votre vocal`);

        // 6. Antiraid
        const antiraid = new EmbedBuilder()
            .setTitle('Antiraid')
            .setColor(color)
            .setFooter({ text: footerText })
            .setDescription(`*Les paramètres peuvent être des noms, des mentions, ou des IDs\nSi ce ne sont pas des mentions ils doivent être séparés par \`,,\`*\n\n**\`${prefix}wl <membre>\`**\nAjoute un membre à la whitelist\n\n**\`${prefix}unwl <membre>\`**\nRetire un membre de la whitelist\n\n**\`${prefix}antitoken <on/off>\`**\nActive ou désactive la protection antitoken\n\n**\`${prefix}secur <on/off/max>\`**\nAffiche ou configure le niveau de sécurité\n\n**\`${prefix}antiupdate <on/off>\`**\nActive ou désactive la protection antiupdate\n\n**\`${prefix}antichannel <on/off>\`**\nActive ou désactive la protection antichannel\n\n**\`${prefix}antirole <on/off>\`**\nActive ou désactive la protection antirole\n\n**\`${prefix}antiwebhook <on/off>\`**\nActive ou désactive la protection antiwebhook\n\n**\`${prefix}antibot <on/off>\`**\nActive ou désactive la protection antibot\n\n**\`${prefix}antiban <on/off>\`**\nActive ou désactive la protection antiban\n\n**\`${prefix}antieveryone <on/off>\`**\nActive ou désactive la protection antieveryone\n\n**\`${prefix}blrank\`**\nConfigure le blacklist rank\n\n**\`${prefix}punition <derank/kick/ban/mute>\`**\nConfigure la punition par défaut de l'antiraid`);

        // 7. Contrôle du bot
        const botcontrol = new EmbedBuilder()
            .setTitle('Contrôle du bot')
            .setColor(color)
            .setFooter({ text: footerText })
            .setDescription(`*Les paramètres peuvent être des noms, des mentions, ou des IDs\nSi ce ne sont pas des mentions ils doivent être séparés par \`,,\`*\n\n**\`${prefix}theme <couleur>\`**\nChange la couleur par défaut des embeds du bot\n\n**\`${prefix}activity <type> <texte>\`**\nModifie l'activité du bot\n\n**\`${prefix}streamurl <url>\`**\nConfigure l'URL de stream Twitch du bot\n\n**\`${prefix}online/idle/dnd/invisible\`**\nChange le statut du bot\n\n**\`${prefix}mp <membre> <message>\`**\nEnvoie un message privé à un membre via le bot\n\n**\`${prefix}bl <membre> [raison]\`**\nAjoute un membre à la blacklist du bot\n\n**\`${prefix}unbl <membre>\`**\nRetire un membre de la blacklist du bot\n\n**\`${prefix}blinfo <membre>\`**\nAffiche les informations de blacklist d'un membre\n\n**\`${prefix}say <message>\`**\nFait parler le bot dans le salon`);

        // 8. Utilitaire
        const utilitaire = new EmbedBuilder()
            .setTitle('Utilitaire')
            .setColor(color)
            .setFooter({ text: footerText })
            .setDescription(`*Les paramètres peuvent être des noms, des mentions, ou des IDs\nSi ce ne sont pas des mentions ils doivent être séparés par \`,,\`*\n\n**\`${prefix}allbots\`**\nAffiche la liste des bots présents sur le serveur\n\n**\`${prefix}alladmins\`**\nAffiche la liste des administrateurs du serveur\n\n**\`${prefix}botadmins\`**\nAffiche la liste des bots administrateurs\n\n**\`${prefix}boosters\`**\nAffiche la liste des boosters du serveur\n\n**\`${prefix}rolemembers <rôle>\`**\nAffiche les membres ayant un rôle précis\n\n**\`${prefix}serverinfo\`**\nAffiche les informations relatives au serveur\n\n**\`${prefix}inviteinfo <invitation>\`**\nAffiche les informations d'une invitation\n\n**\`${prefix}vocinfo\`**\nAffiche l'activité vocale du serveur\n\n**\`${prefix}role <rôle>\`**\nAffiche les informations d'un rôle\n\n**\`${prefix}channel [salon]\`**\nAffiche les informations d'un salon\n\n**\`${prefix}user [membre]\`**\nAffiche les informations d'un utilisateur\n\n**\`${prefix}member [membre]\`**\nAffiche les informations d'un membre\n\n**\`${prefix}pic [membre]\`**\nRécupère la photo de profil d'un membre\n\n**\`${prefix}banner [membre]\`**\nRécupère la bannière d'un membre\n\n**\`${prefix}snipe\`**\nAffiche le dernier message supprimé dans le salon\n\n**\`${prefix}crowbots\`**\nDonne une invitation vers le support CrowBots`);

        const pages = [
            moderation,
            modpara,
            logs,
            configEmbed,
            gestion,
            antiraid,
            botcontrol,
            utilitaire
        ];

        let currentPage = 0;

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('help_category_select')
            .setPlaceholder('Sélectionner une catégorie')
            .addOptions([
                { value: '0', label: 'Modération', emoji: '🔨', default: true },
                { value: '1', label: 'Paramètres de modération', emoji: '⚙' },
                { value: '2', label: 'Logs', emoji: '📡' },
                { value: '3', label: 'Configuration du serveur', emoji: '🔧' },
                { value: '4', label: 'Gestion du serveur', emoji: '🏠' },
                { value: '5', label: 'Antiraid', emoji: '🛡' },
                { value: '6', label: 'Contrôle du bot', emoji: '🤖' },
                { value: '7', label: 'Utilitaire', emoji: '🧰' }
            ]);

        const prevButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel('◀')
            .setCustomId('help_prev');

        const nextButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel('▶')
            .setCustomId('help_next');

        const selectRow = new ActionRowBuilder().addComponents(selectMenu);
        const buttonRow = new ActionRowBuilder().addComponents(prevButton, nextButton);

        const msg = await message.channel.send({
            embeds: [pages[0]],
            components: [selectRow, buttonRow]
        });

        const collector = msg.createMessageComponentCollector({ time: 180000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: 'Vous ne pouvez pas utiliser cette interaction.', flags: 64 });
            }

            if (i.isStringSelectMenu()) {
                currentPage = parseInt(i.values[0], 10);
            } else if (i.customId === 'help_prev') {
                currentPage = currentPage <= 0 ? pages.length - 1 : currentPage - 1;
            } else if (i.customId === 'help_next') {
                currentPage = currentPage >= pages.length - 1 ? 0 : currentPage + 1;
            }

            // Mettre à jour l'option sélectionnée dans le menu déroulant
            selectMenu.options.forEach((opt, idx) => {
                opt.setDefault(idx === currentPage);
            });

            await i.update({
                embeds: [pages[currentPage]],
                components: [new ActionRowBuilder().addComponents(selectMenu), buttonRow]
            }).catch(() => null);
        });

        collector.on('end', () => {
            msg.edit({ components: [] }).catch(() => null);
        });
    }
};
