import path from 'path';
import fs from 'fs';
import { IBDD } from '../types/Bdd';
import { User } from 'discord.js';

const filePath = path.join(__dirname, '..', '..', 'bdd.json');

function loadDatabase(): IBDD {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as IBDD;
}

function saveDatabase(data: IBDD): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function createData(
    user: User | null,
    custom: string | null,
    guild_id: string,
    quote: string,
    added_by: string
) {
    console.log("Insertion d'une nouvelle donnée...");

    const db: IBDD = loadDatabase();

    const isUser = user ? true : false;
    const name = user ? user.username : (custom as string);
    const quoteId = Date.now();

    // Check if guild id is already saved
    if (!db.authors[guild_id]) {
        db.authors[guild_id] = {};
    }

    const id =
        user?.id ||
        Object.entries(db.authors[guild_id]).find(([key, value]) =>
            value.aliases.find((alias) => alias.toLowerCase() === custom?.toLowerCase())
        )?.[0] ||
        (custom as string);

    // Check if author is already saved
    if (!db.authors[guild_id][id]) {
        db.authors[guild_id][id] = {
            type: isUser ? 'user' : 'custom',
            name: name,
            aliases: [],
        };
    }

    if (!db.quotes[guild_id]) {
        db.quotes[guild_id] = {};
    }

    db.quotes[guild_id][quoteId] = {
        authorId: id,
        addedBy: added_by,
        quote,
    };

    saveDatabase(db);
    console.log('Donnée sauvegardé!');
}

export function getRandomCitationFromUser(id_user: string, guild_id: string) {
    console.log('test');
    const db: IBDD = loadDatabase();

    const author = Object.entries(db.authors[guild_id]).find(
        ([key, value]) =>
            key === id_user ||
            value.aliases.find((alias) => alias.toLowerCase() === id_user?.toLowerCase())
    );

    if (!author) {
        return null;
    }

    const authorId = author[0];
    const authorValues = author[1];

    if (db.quotes[guild_id]) {
        const allQuotesUser = Object.entries(db.quotes[guild_id])
            .filter(([key, value]) => value.authorId === authorId)
            .map((obj) => {
                return obj[1];
            });

        const random = Math.floor(Math.random() * allQuotesUser.length);

        return {
            user: {
                id: authorValues.type === 'user' ? authorId : null,
                ...authorValues,
            },
            citation: allQuotesUser[random].quote,
        };
    }

    return null;
}

export function getRandomCitation(guild_id: string) {
    const db: IBDD = loadDatabase();

    if (db.quotes[guild_id]) {
        const allQuotes = Object.values(db.quotes[guild_id]);

        const random = Math.floor(Math.random() * allQuotes.length);

        const quote = allQuotes[random];
        const author = db.authors[guild_id][quote.authorId];

        return {
            user: {
                id: author.type === 'user' ? quote.authorId : null,
                ...author,
            },
            citation: quote.quote,
        };
    }

    return null;
}

export function getAllCitationFromUser(id: string, guild_id: string) {
    const db: IBDD = loadDatabase();

    if (!db.authors[guild_id]) {
        return null;
    }

    const userBdd = Object.entries(db.authors[guild_id]).find(
        ([key, value]) =>
            key === id || value.aliases.find((alias) => alias.toLowerCase() === id?.toLowerCase())
    );

    if (!userBdd) {
        return null;
    }

    return {
        user: {
            id: userBdd[1].type === 'user' ? userBdd[0] : null,
            ...userBdd[1],
        },
        quotes: Object.entries(db.quotes[guild_id])
            .filter(([key, value]) => value.authorId === userBdd[0])
            .map((obj) => {
                return obj[1].quote;
            }),
    };
}
