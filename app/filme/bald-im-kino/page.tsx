'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FiSearch, FiLoader, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '@/lib/AuthContext';
import { useSite } from '@/lib/SiteContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import Image from 'next/image';

interface SoonInCinemaMovie {
  active: number;
  name: string;
  iD: number;
  release: string;
  iMDBRating: number;
  imageUrl: string;
  genres: string[];
  countries: string[];
  actors: string[];
  selected?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function BaldImKinoPage() {
  const [movies, setMovies] = useState<SoonInCinemaMovie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { session } = useAuth();
  const { selectedSiteId } = useSite();

  useEffect(() => {
    if (!session?.apiKey || selectedSiteId === null) return;

    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          endpoint: 'events/soonincinema',
          apikey: session.apiKey,
          siteid: selectedSiteId.toString(),
          includeimages: 2
        });

        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api-proxy`;

        const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          }
        });

        if (!response.ok) {
          throw new Error('Fehler beim Laden der Filme');
        }

        const data = await response.json();
        const moviesWithSelection = data.events.map((movie: SoonInCinemaMovie) => ({
          ...movie,
          selected: movie.active === 1
        }));

        setMovies(moviesWithSelection);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Filme');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [session, selectedSiteId]);

  const handleCheckboxChange = async (movieId: number, checked: boolean) => {
    setMovies(prev =>
      prev.map(movie =>
        movie.iD === movieId ? { ...movie, selected: checked } : movie
      )
    );

    await saveMovieSelections(movieId, checked);
  };

  const saveMovieSelections = async (changedMovieId: number, newCheckedState: boolean) => {
    if (!session?.apiKey || selectedSiteId === null) {
      return;
    }

    try {
      const updatedMovies = movies.map(movie =>
        movie.iD === changedMovieId ? { ...movie, selected: newCheckedState } : movie
      );

      const selectedMovieIds = updatedMovies
        .filter(movie => movie.selected)
        .map(movie => movie.iD)
        .join(',');

      const queryParams = new URLSearchParams({
        endpoint: 'events/soonincinema',
        apikey: session.apiKey
      });

      const body = new URLSearchParams({
        siteid: selectedSiteId.toString(),
        eventids: selectedMovieIds
      });

      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api-proxy`;

      const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to save movie selections:', errorText);
      }
    } catch (err) {
      console.error('Error saving movie selections:', err);
    }
  };

  const filteredMovies = movies.filter(movie =>
    movie.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMovies.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMovies = filteredMovies.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const formatReleaseDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd.MM.yyyy', { locale: de });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Bald im Kino
        </h1>
        <p className="text-muted-foreground mt-2">
          Übersicht über kommende Filme und deren Details. Wählen Sie die Filme aus, die in Ihrem Kino angezeigt werden sollen.
        </p>
      </header>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Kommende Filme
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Filme, die demnächst in die Kinos kommen
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Nach Filmtitel suchen..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="animate-spin text-4xl text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              {error}
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <table className="min-w-full text-left">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide w-12">

                      </th>
                      <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide w-24">
                        Poster
                      </th>
                      <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        Titel
                      </th>
                      <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        Bundesstart
                      </th>
                      <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        Genres
                      </th>
                      <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        Schauspieler
                      </th>
                      <th className="px-4 py-3 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                        IMDb-Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {currentMovies.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground text-sm">
                          {searchQuery ? 'Keine Filme gefunden' : 'Keine kommenden Filme verfügbar'}
                        </td>
                      </tr>
                    ) : (
                      currentMovies.map((movie) => (
                        <tr
                          key={movie.iD}
                          className="hover:bg-muted/60 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={movie.selected}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(movie.iD, checked as boolean)
                              }
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-16 h-20 relative rounded overflow-hidden bg-muted">
                              <Image
                                src={movie.imageUrl && movie.imageUrl !== "" ? movie.imageUrl : "/placeholder-movies.png"}
                                alt={movie.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs font-medium text-foreground">
                              {movie.name}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-foreground">
                              {formatReleaseDate(movie.release)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {movie.countries && movie.countries.length > 0 ? (
                                movie.countries.filter(g => g).map((genre, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {genre}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-foreground">
                              {movie.actors && movie.actors.length > 0
                                ? movie.actors.slice(0, 3).join(', ') +
                                  (movie.actors.length > 3 ? '...' : '')
                                : '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-xs">
                              {movie.iMDBRating > 0 ? (
                                <>
                                  <FiStar className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                  <span className="font-medium text-foreground">{movie.iMDBRating.toFixed(1)}</span>
                                </>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Seite {currentPage} von {totalPages} ({filteredMovies.length} Einträge gesamt)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                    >
                      <FiChevronLeft size={14} />
                      Zurück
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1.5 px-3 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                    >
                      Weiter
                      <FiChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
