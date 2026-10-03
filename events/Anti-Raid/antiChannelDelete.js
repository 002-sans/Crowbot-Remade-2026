const { ChannelType } = require("discord.js");
const { getModule } = require("../../utiles/antiraid");

module.exports = {
    name: "antiChannelDelete",
    async execute(client, auditLogEntry, guild, member, db, isWhitelisted) {
        if (!member || !guild || !db || !auditLogEntry?.targetId || !auditLogEntry?.target) return;
        const conf = getModule(db, "antichannel");
        if (!conf.etat) return;
        if (isWhitelisted?.() && !conf.max) return;

        client.punish(db, conf.punish, member, "supprimé un salon");

        if (client.restoreInProgress?.get(guild.id)) return;

        try {
            const cachedChildren = client.cachedChannel?.get?.(auditLogEntry.targetId)
                ? [...client.cachedChannel.get(auditLogEntry.targetId)]
                : null;

            const queue = client.restoreQueue?.get?.(guild.id) || [];

            if (!queue.some(q => q.targetId === auditLogEntry.targetId)) {
                queue.push({
                    targetId: auditLogEntry.targetId,
                    target: auditLogEntry.target,
                    parentId: client.cachedCategory?.get?.(auditLogEntry.targetId) ?? null,
                    position: client.cachedPositions?.get?.(auditLogEntry.targetId) ?? null,
                    permissions: client.cachedPermissions?.get?.(auditLogEntry.targetId) ?? [],
                    children: cachedChildren
                });
            }

            client.restoreQueue?.set?.(guild.id, queue);
            clearTimeout(client.restoreTimeout?.get?.(guild.id));

            client.restoreTimeout?.set?.(guild.id, setTimeout(async () => {
                try {
                    const items = client.restoreQueue?.get?.(guild.id) || [];
                    client.restoreQueue?.delete?.(guild.id);
                    client.restoreTimeout?.delete?.(guild.id);

                    if (!client.restoreInProgress) client.restoreInProgress = new Map();
                    client.restoreInProgress.set(guild.id, true);

                    items.sort((a, b) => {
                        const aIsCat = a.target?.type === ChannelType.GuildCategory;
                        const bIsCat = b.target?.type === ChannelType.GuildCategory;
                        if (aIsCat !== bIsCat) return aIsCat ? -1 : 1;
                        return (a.position ?? 0) - (b.position ?? 0);
                    });

                    const seen = new Set();
                    const dedupedItems = items.filter(item => {
                        if (seen.has(item.targetId)) return false;
                        seen.add(item.targetId);
                        return true;
                    });

                    const categoryIdsInQueue = new Set(
                        dedupedItems
                            .filter(i => i.target?.type === ChannelType.GuildCategory)
                            .map(i => i.targetId)
                    );

                    const filteredItems = dedupedItems.filter(item => {
                        if (item.target?.type === ChannelType.GuildCategory) return true;
                        return !categoryIdsInQueue.has(item.parentId);
                    });

                    const idMap = new Map();

                    const checkAndFixPositions = async (categoryId, categoryChannel) => {
                        const cachedSiblings = client.cachedChannel?.get?.(categoryId);
                        if (!cachedSiblings || cachedSiblings.length === 0) return;

                        const channelCache = guild.channels?.cache;
                        const currentChildren = typeof channelCache?.filter === 'function'
                            ? channelCache.filter(c => c.parentId === categoryChannel?.id)
                            : [];
                        if (currentChildren.size !== cachedSiblings.length) return;

                        for (const cachedChild of cachedSiblings) {
                            const currentChannel = channelCache?.get?.(cachedChild.id)
                                ?? currentChildren.find(c => c.name === cachedChild.name && c.type === cachedChild.type);

                            if (!currentChannel) continue;

                            if (currentChannel.position !== cachedChild.position) {
                                await currentChannel.setPosition?.(cachedChild.position).catch(() => null);
                            }
                        }
                    };

                    for (const item of filteredItems) {
                        const resolvedParent = item.parentId
                            ? (idMap.get(item.parentId) ?? guild.channels?.cache?.get?.(item.parentId) ?? null)
                            : null;

                        const existing = guild.channels?.cache?.get?.(item.targetId);
                        if (existing) {
                            if (resolvedParent && existing.parentId !== resolvedParent.id) {
                                await existing.setParent?.(resolvedParent.id, {
                                    lockPermissions: false,
                                    reason: "Anti Channel - Restore Parent"
                                }).catch(() => null);
                            }

                            if (item.position !== null) {
                                await existing.setPosition?.(item.position).catch(() => null);
                            }

                            idMap.set(item.targetId, existing);
                            continue;
                        }

                        const created = await guild.channels.create({
                            name: item.target?.name || 'salon_restauré',
                            type: item.target?.type,
                            topic: item.target?.topic || null,
                            nsfw: item.target?.nsfw || false,
                            bitrate: item.target?.bitrate || null,
                            userLimit: item.target?.userLimit || null,
                            rateLimitPerUser: item.target?.rateLimitPerUser || null,
                            parent: resolvedParent?.id ?? null,
                            permissionOverwrites: item.permissions
                        }).catch(() => null);

                        if (!created) continue;

                        idMap.set(item.targetId, created);

                        if (db.logs?.raid === item.targetId) {
                            db.logs.raid = created.id;
                            client.save(guild.id);
                        }

                        if (resolvedParent && created.parentId !== resolvedParent.id) {
                            await new Promise(r => setTimeout(r, 500));
                            await created.setParent?.(resolvedParent.id, {
                                lockPermissions: false,
                                reason: "Anti Channel - Restore Parent"
                            }).catch(() => null);
                        }

                        if (item.position !== null) {
                            await created.setPosition?.(item.position).catch(() => null);
                        }

                        client.cachedPositions?.delete?.(item.targetId);
                        client.cachedCategory?.delete?.(item.targetId);
                        client.cachedPermissions?.delete?.(item.targetId);
                        client.cachedPositions?.set?.(created.id, item.position);
                        client.cachedCategory?.set?.(created.id, resolvedParent?.id ?? null);
                        client.cachedPermissions?.set?.(created.id, item.permissions);

                        if (created.type === ChannelType.GuildCategory) {
                            client.cachedChannel?.delete?.(item.targetId);
                            client.cachedChannel?.set?.(created.id, []);

                            if (item.children) {
                                for (const childData of item.children) {
                                    const childChannel = guild.channels?.cache?.get?.(childData.id);

                                    if (childChannel) {
                                        await new Promise(r => setTimeout(r, 300));
                                        await childChannel.setParent?.(created.id, {
                                            lockPermissions: false,
                                            reason: "Anti Channel - Restore Parent"
                                        }).catch(() => null);

                                        await childChannel.setPosition?.(childData.position).catch(() => null);

                                        client.cachedCategory?.set?.(childChannel.id, created.id);
                                        const siblings = client.cachedChannel?.get?.(created.id) || [];
                                        if (!siblings.find(c => c.id === childChannel.id)) {
                                            siblings.push({ ...childData, id: childChannel.id });
                                        }
                                        client.cachedChannel?.set?.(created.id, siblings);
                                    } else {
                                        const newChild = await guild.channels.create({
                                            name: childData.name,
                                            type: childData.type,
                                            topic: childData.topic,
                                            nsfw: childData.nsfw,
                                            bitrate: childData.bitrate,
                                            userLimit: childData.userLimit,
                                            rateLimitPerUser: childData.rateLimitPerUser,
                                            permissionOverwrites: childData.permissionOverwrites || [],
                                            parent: created.id
                                        }).catch(() => null);

                                        if (!newChild) continue;

                                        await new Promise(r => setTimeout(r, 300));
                                        await newChild.setPosition?.(childData.position).catch(() => null);

                                        client.cachedPositions?.set?.(newChild.id, childData.position);
                                        client.cachedCategory?.set?.(newChild.id, created.id);
                                        client.cachedPermissions?.set?.(newChild.id, childData.permissionOverwrites || []);
                                        const siblings = client.cachedChannel?.get?.(created.id) || [];
                                        siblings.push({ ...childData, id: newChild.id });
                                        client.cachedChannel?.set?.(created.id, siblings);
                                    }
                                }
                            }

                            await checkAndFixPositions(created.id, created);
                        } else if (resolvedParent) {
                            const siblings = client.cachedChannel?.get?.(resolvedParent.id) || [];
                            const oldIdx = siblings.findIndex(c => c.id === item.targetId);
                            if (oldIdx !== -1) {
                                siblings.splice(oldIdx, 1, { ...siblings[oldIdx], id: created.id, position: item.position });
                            } else {
                                siblings.push({ id: created.id, position: item.position });
                            }
                            client.cachedChannel?.set?.(resolvedParent.id, siblings);

                            await checkAndFixPositions(resolvedParent.id, resolvedParent);
                        }
                    }
                } finally {
                    client.restoreInProgress?.set?.(guild.id, false);
                }
            }, 2000));
        } catch (_) {}
    }
}