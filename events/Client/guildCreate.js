const { Client, Guild, AuditLogEvent } = require('discord.js');

module.exports = {
    name: "guildCreate",
    /**
     * @param {Client} client
     * @param {Guild} guild
    */
    async execute(client, guild) {
        if (client.config.securinvite) {
            const ownerIsBuyer = client.config.owners.includes(guild.ownerId) || client.config.buyer === guild.ownerId;
            if (!ownerIsBuyer) {
                await guild.leave().catch(() => null);
                return;
            }
        }

        // Récupération de l'inviteur via les logs d'audit
        let inviterName = 'Inconnu';
        try {
            const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 1 }).catch(() => null);
            const entry = auditLogs?.entries.first();
            if (entry?.executor) {
                inviterName = entry.executor.username;
            }
        } catch {
            // Pas de permission pour voir les logs d'audit
        }

        // Récupération du propriétaire
        const ownerMember = await guild.fetchOwner().catch(() => null);
        const ownerName = ownerMember?.user?.username || guild.ownerId;

        // Création de l'invitation sur un salon textuel
        let inviteUrl = null;
        try {
            const channel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me)?.has('CreateInstantInvite'));
            if (channel) {
                const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 }).catch(() => null);
                if (invite) inviteUrl = invite.url;
            }
        } catch {
            // Ignorer si impossible de créer une invitation
        }

        const inviteText = inviteUrl ? `[lien d'invitation](<${inviteUrl}>)` : `aucun lien`;
        const notificationMessage = `\`${inviterName}\` viens de m'inviter sur \`${guild.name}\` (${guild.memberCount} membres, propriétaire: \`${ownerName}\`, ${inviteText})`;

        client.config.owners.forEach(async ID => {
            const owner = client.users.cache.get(ID) || await client.users.fetch(ID).catch(() => null);
            if (owner) owner.send(notificationMessage).catch(() => null);
        });

        // Mise à jour du cache d'invitations
        client.guilds.cache.forEach(g => {
            g.invites.fetch().then(guildInvites => {
                if (!client.invites) client.invites = {};
                client.invites[g.id] = guildInvites;
            }).catch(() => null);
        });
    }
};