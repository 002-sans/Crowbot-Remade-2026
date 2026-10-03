const { Client, Guild, GuildAuditLogsEntry, AuditLogEvent, ChannelType } = require("discord.js");

module.exports = {
    name: "trustedChannelAction",
    /**
     * @param {Client} client
     * @param {GuildAuditLogsEntry} auditLogEntry
     * @param {Guild} guild
     */
    async execute(client, auditLogEntry, guild) {
        switch (auditLogEntry.action) {

            case AuditLogEvent.ChannelCreate: {
                const { target } = auditLogEntry;
                client.cachedPositions.set(target.id, target.position);
                client.cachedPermissions.set(target.id, target.permissionOverwrites?.cache.map(o => ({
                    id: o.id,
                    allow: o.allow.bitfield.toString(),
                    deny: o.deny.bitfield.toString(),
                    type: o.type
                })) || []);

                if (target.type === ChannelType.GuildCategory) {
                    client.cachedChannel.set(target.id, []);
                } else {
                    client.cachedCategory.set(target.id, target.parentId ?? null);
                    if (target.parentId) {
                        const siblings = client.cachedChannel.get(target.parentId) || [];
                        if (!siblings.find(c => c.id === target.id))
                            siblings.push({
                                id: target.id,
                                name: target.name,
                                type: target.type,
                                topic: target.topic || null,
                                nsfw: target.nsfw || false,
                                bitrate: target.bitrate || null,
                                userLimit: target.userLimit || null,
                                rateLimitPerUser: target.rateLimitPerUser || null,
                                position: target.position,
                                permissionOverwrites: target.permissionOverwrites?.cache.map(o => ({
                                    id: o.id,
                                    allow: o.allow.bitfield.toString(),
                                    deny: o.deny.bitfield.toString(),
                                    type: o.type
                                })) || []
                            });
                        client.cachedChannel.set(target.parentId, siblings);
                    }
                }
                break;
            }

            case AuditLogEvent.ChannelDelete: {
                const { target, targetId } = auditLogEntry;

                if (target.type === ChannelType.GuildCategory) {
                    const children = client.cachedChannel.get(targetId) || [];
                    client.cachedChannel.delete(targetId);
                    client.cachedPositions.delete(targetId);
                    client.cachedPermissions.delete(targetId);
                    for (const child of children) {
                        client.cachedCategory.delete(child.id);
                        client.cachedPositions.delete(child.id);
                        client.cachedPermissions.delete(child.id);
                    }
                } else {
                    const parentId = client.cachedCategory.get(targetId);
                    if (parentId) {
                        const siblings = client.cachedChannel.get(parentId) || [];
                        const idx = siblings.findIndex(c => c.id === targetId);
                        if (idx !== -1) siblings.splice(idx, 1);
                        client.cachedChannel.set(parentId, siblings);
                    }
                    client.cachedCategory.delete(targetId);
                    client.cachedPositions.delete(targetId);
                    client.cachedPermissions.delete(targetId);
                }
                break;
            }

            case AuditLogEvent.ChannelUpdate: {
                const { targetId, changes } = auditLogEntry;
                const positionChange   = changes?.find(c => c.key === "position");
                const parentChange     = changes?.find(c => c.key === "parent_id");
                const permissionChange = changes?.find(c => c.key === "permission_overwrites");

                if (positionChange) {
                    client.cachedPositions.set(targetId, positionChange.new);
                    const parentId = client.cachedCategory.get(targetId);
                    if (parentId) {
                        const siblings = client.cachedChannel.get(parentId) || [];
                        const child = siblings.find(c => c.id === targetId);
                        if (child) child.position = positionChange.new;
                    }
                }

                if (parentChange) {
                    client.cachedCategory.set(targetId, parentChange.new ?? null);

                    const oldSiblings = client.cachedChannel.get(parentChange.old) || [];
                    const idx = oldSiblings.findIndex(c => c.id === targetId);
                    const childData = idx !== -1 ? oldSiblings.splice(idx, 1)[0] : null;
                    client.cachedChannel.set(parentChange.old, oldSiblings);

                    if (parentChange.new) {
                        const newSiblings = client.cachedChannel.get(parentChange.new) || [];
                        if (!newSiblings.find(c => c.id === targetId))
                            newSiblings.push(childData || { id: targetId });
                        client.cachedChannel.set(parentChange.new, newSiblings);
                    }
                }

                if (permissionChange) {
                    client.cachedPermissions.set(targetId, permissionChange.new?.map(o => ({
                        id: o.id,
                        allow: o.allow?.toString() ?? "0",
                        deny: o.deny?.toString() ?? "0",
                        type: o.type
                    })) ?? []);
                }
                break;
            }
        }
    }
}
