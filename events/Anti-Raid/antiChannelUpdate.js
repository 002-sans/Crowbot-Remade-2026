const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiChannelUpdate",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        if (!member || !db || !guild || !auditLogEntry) return;
        const conf = getModule(db, "antichannel");
        if (!conf.etat) return;
        if (isWhitelisted?.() && !conf.max) return;

        const { targetId, changes } = auditLogEntry;
        const positionChange = changes?.find(c => c.key === 'position');
        const parentChange = changes?.find(c => c.key === 'parent_id');
        const permissionChange = changes?.find(c => c.key === 'permission_overwrites');
        const nameChange = changes?.find(c => c.key === 'name');
        const topicChange = changes?.find(c => c.key === 'topic');
        const nsfwChange = changes?.find(c => c.key === 'nsfw');
        const slowmodeChange = changes?.find(c => c.key === 'rate_limit_per_user');

        const hasChange = positionChange || parentChange || permissionChange
            || nameChange || topicChange || nsfwChange || slowmodeChange;

        if (!hasChange) return;

        const actionParts = [];
        if (positionChange) actionParts.push('déplacé un salon');
        if (parentChange) actionParts.push('changé la catégorie d\'un salon');
        if (permissionChange) actionParts.push('modifié les permissions d\'un salon');
        if (nameChange || topicChange || nsfwChange || slowmodeChange) actionParts.push('modifié un salon');

        const actionLabel = [...new Set(actionParts)].join(' / ') || 'modifié un salon';
        client.punish(db, conf.punish, member, actionLabel);

        const channel = guild.channels.cache.get(targetId);
        if (!channel) return;

        const restoreOptions = {};
        if (nameChange) restoreOptions.name = nameChange.old;
        if (topicChange) restoreOptions.topic = topicChange.old ?? null;
        if (nsfwChange) restoreOptions.nsfw = nsfwChange.old ?? false;
        if (slowmodeChange) restoreOptions.rateLimitPerUser = slowmodeChange.old ?? 0;

        if (Object.keys(restoreOptions).length > 0) {
            await channel.edit({ ...restoreOptions, reason: 'Anti Channel - Restore' }).catch(() => null);
        }

        if (permissionChange) {
            for (const overwrite of (permissionChange.old || [])) {
                await channel.permissionOverwrites?.edit?.(overwrite.id, {
                    allow: overwrite.allow,
                    deny: overwrite.deny,
                }, { reason: 'Anti Channel - Restore Permissions' }).catch(() => null);
            }

            const oldIds = new Set((permissionChange.old || []).map(o => o.id));
            for (const overwrite of (permissionChange.new || [])) {
                if (!oldIds.has(overwrite.id)) {
                    await channel.permissionOverwrites?.delete?.(overwrite.id, 'Anti Channel - Restore Permissions').catch(() => null);
                }
            }
        }

        if (parentChange) {
            await channel.setParent(parentChange.old ?? null, {
                lockPermissions: false,
                reason: 'Anti Channel - Restore Category',
            }).catch(() => null);

            client.cachedCategory?.set?.(targetId, parentChange.old ?? null);

            const newSiblings = client.cachedChannel?.get?.(parentChange.new) || [];
            const idx = newSiblings.findIndex(c => c.id === targetId);
            if (idx !== -1) newSiblings.splice(idx, 1);
            client.cachedChannel?.set?.(parentChange.new, newSiblings);

            const oldSiblings = client.cachedChannel?.get?.(parentChange.old) || [];
            if (!oldSiblings.find(c => c.id === targetId)) oldSiblings.push({ id: targetId });
            client.cachedChannel?.set?.(parentChange.old, oldSiblings);
        }

        // Restauration automatique de la position originale (déplacement de salon)
        if (positionChange) {
            const cachedPosition = client.cachedPositions?.get?.(targetId);
            const targetPosition = cachedPosition !== undefined
                ? cachedPosition
                : (positionChange.old ?? undefined);

            if (targetPosition !== undefined) {
                await channel.setPosition(targetPosition, { reason: 'Anti Channel - Restore Position' }).catch(() => null);

                client.log?.(
                    guild,
                    '📍 Position de salon restaurée',
                    `${member} a tenté de déplacer **${channel.name}** (\`${channel.id}\`).\n`
                    + `• Position avant : \`${positionChange.old}\`\n`
                    + `• Position attaque : \`${positionChange.new}\`\n`
                    + `• Position restaurée : \`${targetPosition}\`\n`
                    + `• Date : <t:${Math.floor(Date.now() / 1000)}:F>`,
                );
            }
        }
    },
};
