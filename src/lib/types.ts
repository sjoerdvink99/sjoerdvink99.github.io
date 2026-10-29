export interface NewsItem {
  date: string;
  text: string;
}

export interface Publication {
  slug: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  paperLink: string;
  codeLink?: string;
  videoLink?: string;
  bestPaperAward?: boolean;
  abstract: string;
  bibtex: string;
  teaserImage?: string;
}
