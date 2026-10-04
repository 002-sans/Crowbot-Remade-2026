const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_DIR = path.join(DATA_DIR, 'store');
const SERVEURS_DIR = path.join(__dirname, '..', 'serveurs');
const GIVEAWAYS_FILE = path.join(__dirname, '..', 'giveaways.json');
const BLACKLIST_FILE = path.join(SERVEURS_DIR, 'blacklist.json');
const SKIP_FILES = new Set(['example.json', 'blacklist.json']);

if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });

const guildCache = new Map();
let blacklistCache = null;

function clone(value) {
    return value === undefined ? undefined : structuredClone(value);
}

function isEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return false;
    }
}

function keyToFile(key) {
    // Windows interdit `:` dans les noms de fichiers
    const safe = String(key)
        .replace(/:/g, '__')
        .replace(/[^a-zA-Z0-9._-]/g, '_');
    return path.join(STORE_DIR, `${safe}.json`);
}

function fileToKey(filename) {
    return path.basename(filename, '.json').replace(/__/g, ':');
}

function readKey(key) {
    const file = keyToFile(key);
    if (!fs.existsSync(file)) return undefined;
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return undefined;
    }
}

function writeKey(key, value) {
    // Écriture atomique : un arrêt brutal en pleine écriture laisserait sinon
    // un JSON tronqué, illisible au prochain démarrage.
    const file = keyToFile(key);
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(value));
    fs.renameSync(tmp, file);
}

// Complète les clés absentes d'une sauvegarde existante avec les valeurs par
// défaut, pour qu'un serveur enregistré avant l'ajout d'une option ne renvoie
// pas `undefined` (source de plantages dans les commandes).
function applyDefaults(target, defaults) {
    let changed = false;
    for (const [key, value] of Object.entries(defaults || {})) {
        if (!(key in target)) {
            target[key] = clone(value);
            changed = true;
        } else if (value && typeof value === 'object' && !Array.isArray(value)
            && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
            if (applyDefaults(target[key], value)) changed = true;
        }
    }
    return changed;
}

function removeKey(key) {
    const file = keyToFile(key);
    if (!fs.existsSync(file)) return false;
    fs.unlinkSync(file);
    return true;
}

function listKeys() {
    if (!fs.existsSync(STORE_DIR)) return [];
    return fs.readdirSync(STORE_DIR)
        .filter(f => f.endsWith('.json'))
        .map(fileToKey);
}

const db = {
    async get(key) {
        return clone(readKey(key));
    },

    async set(key, value) {
        writeKey(key, value);
        return value;
    },

    async delete(key) {
        return removeKey(key);
    },

    async has(key) {
        return fs.existsSync(keyToFile(key));
    },

    async clear() {
        guildCache.clear();
        blacklistCache = null;
        for (const key of listKeys()) removeKey(key);
    },

    async keys() {
        return listKeys();
    },

    async values() {
        return listKeys().map(key => clone(readKey(key)));
    },

    async entries() {
        return listKeys().map(key => [key, clone(readKey(key))]);
    },

    async push(key, value) {
        const current = await this.get(key);
        const list = current === undefined ? [] : current;
        if (!Array.isArray(list)) throw new TypeError(`La clé "${key}" n'est pas un tableau`);
        list.push(value);
        await this.set(key, list);
        return list;
    },

    async pull(key, value) {
        const current = await this.get(key);
        if (!Array.isArray(current)) return current === undefined ? [] : current;
        const list = current.filter(item => !isEqual(item, value));
        await this.set(key, list);
        return list;
    },

    async increment(key, amount = 1) {
        const next = (Number(await this.get(key)) || 0) + amount;
        await this.set(key, next);
        return next;
    },

    async decrement(key, amount = 1) {
        return this.increment(key, -amount);
    },

    async ensure(key, defaultValue) {
        const existing = await this.get(key);
        if (existing !== undefined) return existing;
        await this.set(key, defaultValue);
        return clone(defaultValue);
    },

    getGuild(guildId, defaults) {
        if (guildCache.has(guildId)) return guildCache.get(guildId);

        let data = readKey(`guild:${guildId}`);
        if (data === undefined) {
            data = clone(defaults);
            writeKey(`guild:${guildId}`, data);
        } else {
            data = clone(data);
            if (applyDefaults(data, defaults)) writeKey(`guild:${guildId}`, data);
        }

        guildCache.set(guildId, data);
        return data;
    },

    saveGuild(guildId) {
        const data = guildCache.get(guildId);
        if (!data) return;
        writeKey(`guild:${guildId}`, data);
    },

    hasGuild(guildId) {
        return guildCache.has(guildId) || fs.existsSync(keyToFile(`guild:${guildId}`));
    },

    invalidateGuild(guildId) {
        guildCache.delete(guildId);
    },

    getBlacklist() {
        if (blacklistCache) return blacklistCache;
        blacklistCache = clone(readKey('blacklist')) ?? {};
        return blacklistCache;
    },

    saveBlacklist() {
        if (!blacklistCache) blacklistCache = {};
        writeKey('blacklist', blacklistCache);
    },

    migrate() {
        if (readKey('_meta:migrated')) return false;

        if (fs.existsSync(BLACKLIST_FILE)) {
            writeKey('blacklist', JSON.parse(fs.readFileSync(BLACKLIST_FILE, 'utf8')));
            fs.renameSync(BLACKLIST_FILE, `${BLACKLIST_FILE}.migrated.bak`);
        } else if (!fs.existsSync(keyToFile('blacklist'))) {
            writeKey('blacklist', {});
        }

        if (fs.existsSync(SERVEURS_DIR)) {
            for (const file of fs.readdirSync(SERVEURS_DIR)) {
                if (!file.endsWith('.json') || SKIP_FILES.has(file)) continue;
                const guildId = path.basename(file, '.json');
                const filePath = path.join(SERVEURS_DIR, file);
                writeKey(`guild:${guildId}`, JSON.parse(fs.readFileSync(filePath, 'utf8')));
                fs.renameSync(filePath, `${filePath}.migrated.bak`);
            }
        }

        if (fs.existsSync(GIVEAWAYS_FILE)) {
            writeKey('giveaways', JSON.parse(fs.readFileSync(GIVEAWAYS_FILE, 'utf8')));
            fs.renameSync(GIVEAWAYS_FILE, `${GIVEAWAYS_FILE}.migrated.bak`);
        } else if (!fs.existsSync(keyToFile('giveaways'))) {
            writeKey('giveaways', []);
        }

        writeKey('_meta:migrated', true);
        return true;
    },
};

db.migrate();

module.exports = db;
