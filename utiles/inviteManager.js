const { EventEmitter } = require("node:events")

module.exports = class InviteManager extends EventEmitter {
    constructor(client) {
        super()

        this.client = client
        this.invites = new Map()

        client.on("ready", async () => {
            client.guilds.cache.forEach(async guild => {
                const guildInvites = await guild.invites.fetch().catch(() => null)
                guildInvites?.forEach(invite => {
                    this.invites.set(invite.code, invite.uses)
                });

                if (guild.features.includes("VANITY_URL")) {
                    const vanityData = await guild.fetchVanityData().catch(() => null)
                    if (vanityData) {
                        this.invites.set(`vanity_${guild.id}`, vanityData.uses)
                    }
                }
            })
        })

        client.on("guildCreate", async guild => {
            const guildInvites = await guild.invites.fetch().catch(() => null)
            guildInvites?.forEach(invite => {
                this.invites.set(invite.code, invite.uses)
            })
        })

        client.on("guildMemberAdd", async member => {
            const joinType = await this.#detectJoinType(member);

            this.client.emit("guildMemberInvite", {
                guildId: member.guild.id,
                type: joinType.type,
                inviter: joinType.inviter || null,
                member: member
            })
        })

        client.on("guildMemberRemove", async member => {
            const db = this.client.get(member.guild.id);
            const inviterData = db.inviter.find(i => i.joiners.includes(member.id));
        
            this.client.emit("guildMemberDelete", {
                guildId: member.guild.id,
                member: member,
                inviter: inviterData ? await client.users.fetch(inviterData.id).catch(() => null) : null
            });
        });
        
    }

    async #detectJoinType(member) {
        const guildInvites = await member.guild.invites.fetch().catch(() => null)
        const previousInvites = this.invites
        let result = { type: 0, invite: null, inviter: null }
    
        if (guildInvites) {
            const usedInvite = guildInvites.find(invite => previousInvites.get(invite.code) && previousInvites.get(invite.code) < invite.uses);

            if (usedInvite) {
                result = {
                    type: 1, 
                    invite: usedInvite,
                    inviter: usedInvite.inviter
                }

                this.invites.set(usedInvite.code, usedInvite.uses)
                return result
            }
        }
    
        if (member.guild.features.includes("VANITY_URL")) {
            const vanityData = await member.guild.fetchVanityData().catch(() => null)
            if (vanityData && vanityData.uses > (this.invites.get(`vanity_${member.guild.id}`) || 0)) {
                this.invites.set(`vanity_${member.guild.id}`, vanityData.uses) 
                result.type = 2 
                return result
            }
        }
    
        if (member.user.bot) {
            result.type = 3 
            return result
        }
    
        return result 
    }
    
}
