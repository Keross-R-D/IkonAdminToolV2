import { TokensList, Lexer } from 'marked';

export async function parseMarkdown(source: string): Promise<TokensList> {
    const lexer = new Lexer();
    return lexer.lex(source);
}