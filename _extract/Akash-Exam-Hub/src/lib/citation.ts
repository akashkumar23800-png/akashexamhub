export type CitationFormat = 'apa' | 'mla';
export type CitationSourceType = 'book' | 'website';

export interface CitationInput {
  format: CitationFormat;
  sourceType: CitationSourceType;
  authors: string;
  title: string;
  year: string;
  publisher: string;
  url: string;
}

function withPeriod(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

export function buildCitation(input: CitationInput): string {
  const authors = withPeriod(input.authors.trim());
  const title = input.title.trim();
  const year = input.year.trim();
  const publisher = input.publisher.trim();
  const url = input.url.trim();

  if (input.format === 'apa') {
    const parts = [authors, `(${year}).`, withPeriod(title), publisher ? withPeriod(publisher) : '', input.sourceType === 'website' ? url : ''];
    return parts.filter(Boolean).join(' ');
  }

  if (input.sourceType === 'book') {
    return `${authors} ${withPeriod(title)} ${publisher ? `${publisher}, ` : ''}${year}.`;
  }
  return `${authors} "${title}." ${publisher ? `${publisher}, ` : ''}${year}${url ? `, ${url}` : ''}.`;
}
