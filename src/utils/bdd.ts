import path from 'path';
import fs from 'fs';
import { IBDD } from '../types/Bdd';

const filePath = path.join(__dirname, '..', '..', 'bdd.json');

function loadDatabase(): IBDD {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as IBDD;
}

function saveDatabase(data: IBDD): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function createData(id: string, content: string) {
    console.log("Insertion d'une nouvelle donnée...");
    const db: IBDD = loadDatabase();

    if (db[id]) {
        db[id].push(content);
    } else {
        db[id] = [content];
    }

    saveDatabase(db);
    console.log('Donnée sauvegardé!');
}

export function getRandomCitationFromUser(id: string) {
    const db: IBDD = loadDatabase();

    if (db[id]) {
        const random = Math.floor(Math.random() * db[id].length);

        return {
            user: db[id][random],
            citation: db[id][random],
        };
    }

    return null;
}

export function getRandomCitation() {
    const db: IBDD = loadDatabase();

    const allUser = Object.keys(db);

    const randomUser = Math.floor(Math.random() * allUser.length);

    const userCitations = db[allUser[randomUser]];

    const randomCitation = Math.floor(Math.random() * userCitations.length);

    return {
        user: allUser[randomUser],
        citation: userCitations[randomCitation],
    };
}

export function getAllCitationFromUser(id: string) {
    const db: IBDD = loadDatabase();

    if (db[id]) {
        return db[id];
    }

    return [];
}
