require('dotenv').config();
const fs      = require('node:fs');
const path    = require('node:path');
const Discord = require('discord.js');
const example = require('./serveurs/example.json');
const backups = require('@outwalk/discord-backup');
const InviteManager = require('./utiles/inviteManager');
const db = require('./utiles/database');
const JsonGiveawaysManager = require('./utiles/giveawaysManager');

if (!fs.existsSync(path.join(__dirname, "backups"))) {
    fs.mkdirSync(path.join(__dirname, "backups"));
}

console.clear()
backups.setStorageFolder(path.join(__dirname, "backups"))

const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.AutoModerationConfiguration,
        Discord.GatewayIntentBits.AutoModerationExecution,
        Discord.GatewayIntentBits.DirectMessageReactions,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.DirectMessageTyping,
        Discord.GatewayIntentBits.GuildEmojisAndStickers,
        Discord.GatewayIntentBits.GuildIntegrations,
        Discord.GatewayIntentBits.GuildInvites,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessageReactions,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.GuildMessageTyping,
        Discord.GatewayIntentBits.GuildModeration,
        Discord.GatewayIntentBits.GuildPresences,
        Discord.GatewayIntentBits.GuildScheduledEvents,
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildWebhooks,
        Discord.GatewayIntentBits.MessageContent,
    ],
    partials: [
        Discord.Partials.Channel,
        Discord.Partials.Message,
        Discord.Partials.GuildMember,
        Discord.Partials.GuildScheduledEvent,
        Discord.Partials.User,
        Discord.Partials.Reaction,
        Discord.Partials.ThreadMember
    ],
    presence: {
        status: 'online'
    }
})


client.db = db;
client.resolvers = require('./utiles/resolvers');
client.resolveMembers = (guild, input, mentions) => client.resolvers.resolveMembers(guild, input, mentions);
client.resolveRoles = (guild, input, mentions) => client.resolvers.resolveRoles(guild, input, mentions);
client.resolveChannels = (guild, input, mentions) => client.resolvers.resolveChannels(guild, input, mentions);
client.cleanInput = (str) => client.resolvers.cleanInput(str).map((p) => {
    const id = client.resolvers.extractId(p);
    return /^\d{17,20}$/.test(String(id)) ? String(id) : p;
});
client.collectUserIds = (message, text) => client.resolvers.collectUserIds(message, text);
client.invites  = new InviteManager(client);
client.config   = require('./config.json');
client.snipes   = new Discord.Collection();
client.commands = new Discord.Collection();
client.cachedChannel = new Map();
client.cachedPositions = new Map();
client.cachedCategory = new Map();
client.cachedPermissions = new Map();
client.positions = client.cachedPositions;
client.restoreQueue = new Map();
client.restoreTimeout = new Map();
client.restoreInProgress = new Map();
client.captchaSessions = new Map();
client.captchaInviters = new Map();
client.giveawaysManager = new JsonGiveawaysManager(client, {
    default: { botsCanWin: false, reaction: '🎉', lastChance: false }
});

if (client.config.presence.status == "mobile") Object.defineProperty(Discord.DefaultWebSocketManagerOptions.identifyProperties, 'browser', {
    value: "Discord Android",
    writable: true,
    enumerable: true,
    configurable: true
});

function guildDefaults() {
    const defaults = structuredClone(example);
    defaults.prefix = client.config.prefix;
    return defaults;
}

client.get = guildId => db.getGuild(guildId, guildDefaults());
client.save = guildId => db.saveGuild(guildId);
client.getBlacklist = () => db.getBlacklist();
client.saveBlacklist = () => db.saveBlacklist();

client.isBuyer = (userId) => !!client.config.buyer && client.config.buyer === userId;
client.isBotOwner = (userId) => client.isBuyer(userId) || (client.config.owners || []).includes(userId);

client.perm = function (permLevel, memberId, channelId, guild) {
    if (client.isBuyer(memberId)) return true;

    const data = client.get(guild.id);

    if (client.isBotOwner(memberId)) {
        if (permLevel === "buyer") return false;
        return true;
    }

    if (permLevel === "buyer") return false;
    if (permLevel === "owner") return false;

    const member = guild.members.cache.get(memberId);
    if (!member) return false;

    if (!data.perms) return false;

    const level = typeof permLevel === "string" ? parseInt(permLevel, 10) : permLevel;
    if (isNaN(level)) return false;

    if (level === 1 && (
        !data.public?.disabled?.includes(channelId) ||
        data.public?.channels?.includes(channelId) ||
        data.public?.etat
    ))
        return true;

    for (let i = level; i <= 9; i++) {
        const entries = data.perms[String(i)] || data.perms[i] || [];
        if (entries.find(c => c.userId === memberId) ||
            member.roles.cache.some(r => entries.find(c => c.roleId === r.id)))
            return true;
    }

    return false;
};

client.saveConfig = () => fs.writeFileSync('./config.json', JSON.stringify(client.config, null, 4));

client.ms = temps => {
    const match = temps.match(/(\d+)([smhdwy])/);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'w': return value * 7 * 24 * 60 * 60 * 1000;
        case 'y': return value * 365 * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

client.log = (guild, title, dsc) => {
    const data = client.get(guild.id);
    const logChannel = guild.channels.cache.get(data.logs?.raid);
    const pings = (data.raidping || [])
        .map(id => guild.roles.cache.get(id) ? `<@&${id}>` : `<@${id}>`)
        .join(' ');

    const embed = new Discord.EmbedBuilder()
        .setTitle(title ?? null)
        .setColor(0xFF0000)
        .setDescription(dsc)
        .setTimestamp()

    if (logChannel) return logChannel.send({ content: pings || undefined, embeds: [ embed ] });
    return true;    
}

client.punish = (data, punishMode, member, description) => {
    if (!member || !data) return;
    const mode = punishMode || data.antiraid?.punish || 'derank';

    switch (mode) {
        case "mute":
            member.timeout(1000 * 60 * 10, "Anti Raid")
                .then(() => client.log(member.guild, null, `${member} a **${description}** et a été **mute**`))
                .catch(() => client.log(member.guild, null, `${member} a **${description}** mais n'a pas pu être mute`));
            break;

        case "derank": {
            const noderank = [];
            for (const id of data.antiraid?.noderank || []) {
                const role = member.guild.roles.cache.get(id);
                if (role) noderank.push(role);
            }
            member.roles.set(noderank, "Anti Raid")
                .then(() => client.log(member.guild, null, `${member} a **${description}** et a été **derank**`))
                .catch(() => client.log(member.guild, null, `${member} a **${description}** mais n'a pas pu être derank`));
            break;
        }

        case "kick":
            member.kick("Anti Raid")
                .then(() => client.log(member.guild, null, `${member} a **${description}** et a été **expulsé**`))
                .catch(() => client.log(member.guild, null, `${member} a **${description}** mais n'a pas pu être expulsé`));
            break;

        case "ban":
            member.ban({ reason: "Anti Raid" })
                .then(() => client.log(member.guild, null, `${member} a **${description}** et a été **banni**`))
                .catch(() => client.log(member.guild, null, `${member} a **${description}** mais n'a pas pu être banni`));
            break;
    }
}

const eventDirs = fs.readdirSync("./events");
for (const dir of eventDirs) {
    const events = fs.readdirSync(`./events/${dir}/`).filter(files => files.endsWith(".js"));
    for (const file of events){
        const event = require(`./events/${dir}/${file}`);
        if (event.once) 
            client.once(event.name, (...args) => event.execute(client, ...args));
        else 
            client.on(event.name, (...args) => event.execute(client, ...args));
    }
};

const dirs = fs.readdirSync("./commands");
for (const dir of dirs){
    const commands = fs.readdirSync(`./commands/${dir}/`).filter(files => files.endsWith(".js"));
    for (const file of commands) {
        const command = require(`./commands/${dir}/${file}`);
        client.commands.set(command.name, command);
    };
}

async function errorHandler(error) {
    const codes = [ 10062, 40060, 50013 ];
    if (codes.includes(error.code)) return;

    console.log(error);
}; 
process.on("unhandledRejection", errorHandler);
process.on("uncaughtException", errorHandler);
process.on('warning', () => false);


client.login(process.env.BOT_TOKEN || client.config.token);