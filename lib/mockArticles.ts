import { ArticleTransaction, ArticleGroupStats, ArticleKPIs } from '@/types/articles';

const movieTitles = [
  'Oppenheimer',
  'Barbie',
  'Mission: Impossible',
  'The Super Mario Bros. Movie',
  'Guardians of the Galaxy Vol. 3',
  'Fast X',
  'Spider-Man: Across the Spider-Verse',
];

const articles = {
  snacks: ['Popcorn Groß', 'Popcorn Klein', 'Nachos', 'M&Ms', 'Skittles', 'Snickers'],
  drinks: ['Cola 0,5L', 'Cola 1L', 'Sprite 0,5L', 'Fanta 0,5L', 'Wasser 0,5L', 'Bier 0,4L'],
  combos: [
    'Popcorn + Cola Combo',
    'Nachos + Cola Combo',
    'Family Pack (2x Popcorn + 2x Getränke)',
    'Date Night (Popcorn Groß + 2x Getränke)',
  ],
};

const halls = ['Saal 1', 'Saal 2', 'Saal 3', 'Saal 4', 'Saal 5', 'IMAX Saal', 'VIP Lounge'];

function generateTransactionId(): string {
  return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
}

function getRandomTime(): string {
  const hours = Math.floor(Math.random() * 12) + 10;
  const minutes = Math.random() < 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

function getRandomArticle(): { name: string; group: string; price: number } {
  const groupKeys = Object.keys(articles);
  const randomGroup = groupKeys[Math.floor(Math.random() * groupKeys.length)] as keyof typeof articles;
  const groupArticles = articles[randomGroup];
  const randomArticle = groupArticles[Math.floor(Math.random() * groupArticles.length)];

  let price = 0;
  if (randomGroup === 'snacks') price = Math.random() < 0.5 ? 4.5 : 6.5;
  else if (randomGroup === 'drinks') price = Math.random() < 0.3 ? 3.5 : 4.5;
  else price = Math.random() < 0.5 ? 12.9 : 16.9;

  return {
    name: randomArticle,
    group: randomGroup === 'snacks' ? 'Snacks' : randomGroup === 'drinks' ? 'Getränke' : 'Combos',
    price,
  };
}

export function generateMockArticleTransactions(count: number = 50): ArticleTransaction[] {
  const transactions: ArticleTransaction[] = [];
  const now = new Date();
  let idCounter = 1;

  for (let i = 0; i < count; i++) {
    const transactionId = generateTransactionId();
    const showtime = getRandomTime();
    const movieTitle = movieTitles[Math.floor(Math.random() * movieTitles.length)];
    const hall = halls[Math.floor(Math.random() * halls.length)];
    const isCancelled = Math.random() < 0.05;

    const timestamp = new Date(now);
    timestamp.setHours(parseInt(showtime.split(':')[0]));
    timestamp.setMinutes(parseInt(showtime.split(':')[1]));
    timestamp.setSeconds(Math.floor(Math.random() * 60));

    const isMultiArticleTransaction = Math.random() < 0.25;

    if (isMultiArticleTransaction) {
      const numArticles = Math.floor(Math.random() * 3) + 2;
      const articleTypes = ['snacks', 'drinks'];

      for (let j = 0; j < numArticles; j++) {
        const article = getRandomArticle();

        transactions.push({
          id: `art_${idCounter++}`,
          transactionId,
          showtime,
          movieTitle,
          hall,
          articleName: article.name,
          amount: article.price,
          isCancelled,
          timestamp: timestamp.toISOString(),
          articleGroup: article.group,
        });
      }
    } else {
      const article = getRandomArticle();

      transactions.push({
        id: `art_${idCounter++}`,
        transactionId,
        showtime,
        movieTitle,
        hall,
        articleName: article.name,
        amount: article.price,
        isCancelled,
        timestamp: timestamp.toISOString(),
        articleGroup: article.group,
      });
    }
  }

  return transactions.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function calculateArticleKPIs(transactions: ArticleTransaction[]): ArticleKPIs {
  const activeTransactions = transactions.filter(t => !t.isCancelled);

  const todayRevenue = activeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const presaleRevenue = todayRevenue * 0.65;

  const uniqueTransactionIds = new Set(activeTransactions.map(t => t.transactionId));
  const todayTransactionsCount = uniqueTransactionIds.size;

  const articleRevenue = new Map<string, { revenue: number; quantity: number }>();
  activeTransactions.forEach(t => {
    const current = articleRevenue.get(t.articleName) || { revenue: 0, quantity: 0 };
    articleRevenue.set(t.articleName, {
      revenue: current.revenue + t.amount,
      quantity: current.quantity + 1,
    });
  });

  let bestArticle = { name: '', revenue: 0, quantity: 0 };
  articleRevenue.forEach((data, name) => {
    if (data.revenue > bestArticle.revenue) {
      bestArticle = { name, ...data };
    }
  });

  const groupRevenue = new Map<string, number>();
  activeTransactions.forEach(t => {
    groupRevenue.set(t.articleGroup, (groupRevenue.get(t.articleGroup) || 0) + t.amount);
  });

  let bestGroup = { name: '', revenue: 0 };
  groupRevenue.forEach((revenue, name) => {
    if (revenue > bestGroup.revenue) {
      bestGroup = { name, revenue };
    }
  });

  return {
    presaleRevenue,
    todayTransactions: todayTransactionsCount,
    todayRevenue,
    bestArticle,
    bestGroup,
  };
}

export function calculateGroupStats(transactions: ArticleTransaction[]): ArticleGroupStats[] {
  const activeTransactions = transactions.filter(t => !t.isCancelled);
  const stats = new Map<string, { revenue: number; transactions: number }>();

  activeTransactions.forEach(t => {
    const current = stats.get(t.articleGroup) || { revenue: 0, transactions: 0 };
    stats.set(t.articleGroup, {
      revenue: current.revenue + t.amount,
      transactions: current.transactions + 1,
    });
  });

  const colors = {
    'Snacks': 'hsl(var(--chart-1))',
    'Getränke': 'hsl(var(--chart-2))',
    'Combos': 'hsl(var(--chart-3))',
  };

  return Array.from(stats.entries()).map(([group, data]) => ({
    group,
    revenue: data.revenue,
    transactions: data.transactions,
    color: colors[group as keyof typeof colors] || 'hsl(var(--chart-4))',
  }));
}
