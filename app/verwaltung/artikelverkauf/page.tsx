'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiAward,
  FiPackage,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import {
  generateMockArticleTransactions,
  calculateArticleKPIs,
  calculateGroupStats,
} from '@/lib/mockArticles';
import { ArticleTransaction } from '@/types/articles';

export default function ArtikelverkaufPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const transactions = useMemo(() => generateMockArticleTransactions(80), []);
  const kpis = useMemo(() => calculateArticleKPIs(transactions), [transactions]);
  const groupStats = useMemo(() => calculateGroupStats(transactions), [transactions]);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    const term = searchTerm.toLowerCase();
    return transactions.filter(
      t =>
        t.movieTitle.toLowerCase().includes(term) ||
        t.articleName.toLowerCase().includes(term) ||
        t.transactionId.includes(term) ||
        t.hall.toLowerCase().includes(term)
    );
  }, [transactions, searchTerm]);

  const getTransactionTotal = (transactionId: string) => {
    return transactions
      .filter(t => t.transactionId === transactionId)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const isFirstInGroup = (transaction: ArticleTransaction, index: number) => {
    if (index === 0) return true;
    return filteredTransactions[index - 1].transactionId !== transaction.transactionId;
  };

  const getTransactionArticles = (transactionId: string) => {
    return transactions.filter(t => t.transactionId === transactionId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatTime = (time: string) => {
    return `${time} Uhr`;
  };

  const currentDate = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Artikelverkauf</h1>
        <p className="text-sm text-muted-foreground">{currentDate}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-chart-1/10 to-chart-1/5 border-chart-1/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Vorverkäufe Heute</p>
              <p className="text-2xl font-bold text-chart-1">{formatCurrency(kpis.presaleRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                ~65% des Tagesumsatzes
              </p>
            </div>
            <div className="p-2 bg-chart-1/20 rounded-lg">
              <FiDollarSign className="text-chart-1" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Transaktionen Heute</p>
              <p className="text-2xl font-bold text-chart-2">{kpis.todayTransactions}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(kpis.todayRevenue / kpis.todayTransactions).toFixed(2)} € Ø
              </p>
            </div>
            <div className="p-2 bg-chart-2/20 rounded-lg">
              <FiShoppingCart className="text-chart-2" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Umsatz Heute</p>
              <p className="text-2xl font-bold text-chart-3">{formatCurrency(kpis.todayRevenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Artikelverkäufe gesamt
              </p>
            </div>
            <div className="p-2 bg-chart-3/20 rounded-lg">
              <FiTrendingUp className="text-chart-3" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Bester Artikel</p>
              <p className="text-sm font-bold text-chart-4 mb-0.5">{kpis.bestArticle.name}</p>
              <p className="text-lg font-bold text-chart-4">{formatCurrency(kpis.bestArticle.revenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {kpis.bestArticle.quantity}x verkauft
              </p>
            </div>
            <div className="p-2 bg-chart-4/20 rounded-lg">
              <FiAward className="text-chart-4" size={20} />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-chart-5/10 to-chart-5/5 border-chart-5/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Beste Artikelgruppe</p>
              <p className="text-sm font-bold text-chart-5 mb-0.5">{kpis.bestGroup.name}</p>
              <p className="text-lg font-bold text-chart-5">{formatCurrency(kpis.bestGroup.revenue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Höchster Gruppenumsatz
              </p>
            </div>
            <div className="p-2 bg-chart-5/20 rounded-lg">
              <FiPackage className="text-chart-5" size={20} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Umsatz nach Artikelgruppe</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={groupStats}
                dataKey="revenue"
                nameKey="group"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => `${entry.group}: ${formatCurrency(entry.revenue)}`}
              >
                {groupStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Transaktionen nach Artikelgruppe</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={groupStats}>
              <XAxis dataKey="group" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip />
              <Bar dataKey="transactions" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Artikeltransaktionen</h2>
            <p className="text-sm text-muted-foreground">
              {filteredTransactions.length} von {transactions.length} Transaktionen
            </p>
          </div>
          <div className="relative w-80">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Suche nach Film, Artikel, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Vorstellung</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Film</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Saal</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Transaktions-ID</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Artikel</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Betrag</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => {
                const isFirst = isFirstInGroup(transaction, index);
                const transactionArticles = getTransactionArticles(transaction.transactionId);
                const isMultiArticle = transactionArticles.length > 1;
                const totalAmount = getTransactionTotal(transaction.transactionId);

                return (
                  <tr
                    key={transaction.id}
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${
                      transaction.isCancelled ? 'opacity-50' : ''
                    } ${!isFirst ? 'bg-muted/10' : ''}`}
                  >
                    <td className="py-3 px-4">
                      {isFirst ? (
                        <div className="text-sm font-medium text-foreground">{formatTime(transaction.showtime)}</div>
                      ) : (
                        <div className="text-sm text-transparent">-</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isFirst ? (
                        <div className="text-sm text-foreground max-w-[200px] truncate">
                          {transaction.movieTitle}
                        </div>
                      ) : (
                        <div className="text-sm text-transparent">-</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isFirst ? (
                        <div className="text-sm text-muted-foreground">{transaction.hall}</div>
                      ) : (
                        <div className="text-sm text-transparent">-</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isFirst ? (
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-mono text-muted-foreground">{transaction.transactionId}</div>
                          {isMultiArticle && (
                            <Badge variant="secondary" className="text-xs">
                              {transactionArticles.length} Artikel
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-transparent">-</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className={`flex items-center gap-2 ${!isFirst ? 'pl-6' : ''}`}>
                        {!isFirst && <span className="text-muted-foreground mr-1">↳</span>}
                        <span className="text-sm text-foreground">{transaction.articleName}</span>
                        <Badge variant="outline" className="text-xs">
                          {transaction.articleGroup}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(transaction.amount)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isFirst ? (
                        <div
                          className={`text-sm font-semibold ${
                            transaction.isCancelled ? 'line-through text-muted-foreground' : 'text-chart-1'
                          }`}
                        >
                          {formatCurrency(totalAmount)}
                        </div>
                      ) : (
                        <div className="text-sm text-transparent">-</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isFirst ? (
                        transaction.isCancelled ? (
                          <Badge variant="destructive" className="text-xs">
                            Storniert
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                            Aktiv
                          </Badge>
                        )
                      ) : (
                        <div className="text-sm text-transparent">-</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <FiSearch className="mx-auto text-muted-foreground mb-2" size={48} />
            <p className="text-muted-foreground">Keine Transaktionen gefunden</p>
          </div>
        )}
      </Card>
    </div>
  );
}
