interface IAuthor {
    name: string;
    type: 'user' | 'custom';
    aliases: string[];
}

interface IQuote {
    authorId: string;
    quote: string;
    addedBy: string;
}

export interface IBDD {
    authors: {
        [guildId: string]: {
            [id: string]: IAuthor;
        };
    };
    quotes: {
        [guildId: string]: {
            [id: string]: IQuote;
        };
    };
}
