const { GiveawaysManager } = require('discord-giveaways');
const db = require('./database');

class JsonGiveawaysManager extends GiveawaysManager {
    async getAllGiveaways() {
        return (await db.get('giveaways')) || [];
    }

    async saveGiveaway(messageId, giveawayData) {
        const giveaways = (await db.get('giveaways')) || [];
        giveaways.push(giveawayData);
        await db.set('giveaways', giveaways);
        return true;
    }

    async editGiveaway(messageId, giveawayData) {
        const giveaways = (await db.get('giveaways')) || [];
        const index = giveaways.findIndex(g => g.messageId === messageId);
        if (index !== -1) giveaways[index] = giveawayData;
        await db.set('giveaways', giveaways);
        return true;
    }

    async deleteGiveaway(messageId) {
        const giveaways = ((await db.get('giveaways')) || []).filter(g => g.messageId !== messageId);
        await db.set('giveaways', giveaways);
        return true;
    }
}

module.exports = JsonGiveawaysManager;
