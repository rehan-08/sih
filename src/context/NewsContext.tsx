import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { NewsArticle } from '../types';
import { newsArticlesData, pendingNewsPool } from '../data/newsData';

export interface NewsContextType {
  articles: NewsArticle[];
}

const MAX_ARTICLES = 20;
const MIN_INTERVAL_MS = 60000;
const MAX_INTERVAL_MS = 100000;

const INDIAN_PORTS = ['Paradip', 'Visakhapatnam', 'Gangavaram', 'Gopalpur', 'Haldia', 'Dhamra'];
const isIndianPortArticle = (a: NewsArticle) => a.affectedPorts.some(p => INDIAN_PORTS.includes(p));

const NewsContext = createContext<NewsContextType | undefined>(undefined);

export const NewsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<NewsArticle[]>(newsArticlesData);
  const poolIndexRef = useRef<number>(0);

  const publishNext = useCallback(() => {
    const template = pendingNewsPool[poolIndexRef.current % pendingNewsPool.length];
    poolIndexRef.current += 1;

    const freshArticle: NewsArticle = {
      ...template,
      id: `${template.id}-${Date.now()}`,
      publishedAt: 'Just now'
    };

    setArticles(prev => [freshArticle, ...prev].slice(0, MAX_ARTICLES));
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      const delay = MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
      timeoutId = setTimeout(() => {
        publishNext();
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, [publishNext]);

  // Indian-port coverage surfaces first (per the "Indian ports first" ask), except freshly
  // injected live articles which stay pinned at the very top regardless — recency still wins
  // for genuinely breaking news.
  const sortedArticles = useMemo(() => {
    const live = articles.filter(a => a.publishedAt === 'Just now');
    const rest = articles.filter(a => a.publishedAt !== 'Just now');
    const indianRest = rest.filter(isIndianPortArticle);
    const otherRest = rest.filter(a => !isIndianPortArticle(a));
    return [...live, ...indianRest, ...otherRest];
  }, [articles]);

  return (
    <NewsContext.Provider value={{ articles: sortedArticles }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = (): NewsContextType => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
