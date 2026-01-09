'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Movie, ApiEventsResponse, ApiEvent } from '@/types/movies';
import { FiSearch, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/lib/AuthContext';
import { useSite } from '@/lib/SiteContext';
import { useDateRange } from '@/lib/DateRangeContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FilmbeschreibungenPage() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedStartDate, setEditedStartDate] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMovies, setCurrentMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { session } = useAuth();
  const { selectedSiteId } = useSite();
  const { dateRange } = useDateRange();

  const transformApiEventToMovie = (event: ApiEvent, isCurrentlyShowing: boolean): Movie => {
    const posterUrl = event.images?.posters?.[0]?.url || '/placeholder-movies.png';
    return {
      id: event.eventID.toString(),
      title: event.name,
      posterUrl: posterUrl,
      description: event.description || event.shortInfo || '',
      startDate: event.releaseDate ? format(new Date(event.releaseDate), 'yyyy-MM-dd') : '',
      isCurrentlyShowing
    };
  };

  useEffect(() => {
    const fetchMovies = async () => {
      if (!session?.apiKey || selectedSiteId === null) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fromDate = "DATE";
        const toDate = "DATE426";

        const currentParams = new URLSearchParams({
          endpoint: 'events',
          apikey: session.apiKey,
          siteid: selectedSiteId.toString(),
          hideversions: '1',
          language: 'de',
          includeimages: '1',
          from: fromDate,
          to: toDate
        });

        const upcomingParams = new URLSearchParams({
          endpoint: 'events/comingsoon',
          apikey: session.apiKey,
          siteid: selectedSiteId.toString(),
          hideversions: '1',
          language: 'de',
          includeimages: '1',
          from: fromDate,
          to: toDate
        });

        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api-proxy`;

        const [currentResponse, upcomingResponse] = await Promise.all([
          fetch(`${apiUrl}?${currentParams.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
          }).then(res => {
            if (!res.ok) throw new Error('API-Fehler');
            return res.json() as Promise<ApiEventsResponse>;
          }),
          fetch(`${apiUrl}?${upcomingParams.toString()}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
          }).then(res => {
            if (!res.ok) throw new Error('API-Fehler');
            return res.json() as Promise<ApiEventsResponse>;
          })
        ]);

        const current = currentResponse.events?.map(event => transformApiEventToMovie(event, true)) || [];
        const upcoming = upcomingResponse.events?.map(event => transformApiEventToMovie(event, false)) || [];

        setCurrentMovies(current);
        setUpcomingMovies(upcoming);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Filme');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [session?.apiKey, selectedSiteId, dateRange]);

  const filterMovies = (movies: Movie[]) => {
    if (!searchQuery.trim()) return movies;
    return movies.filter(movie =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredCurrentMovies = filterMovies(currentMovies);
  const filteredUpcomingMovies = filterMovies(upcomingMovies);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setEditedDescription(movie.description);
    setEditedStartDate(movie.startDate);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedMovie || !session?.apiKey || selectedSiteId === null) {
      toast.error('Fehlende Informationen zum Speichern');
      return;
    }

    if (editedDescription === '' && editedStartDate === '') {
      toast.error('Bitte geben Sie eine Beschreibung oder ein Startdatum ein');
      return;
    }

    setIsSaving(true);

    try {
      const bodyParams = new URLSearchParams();

      if (editedDescription !== '') {
        bodyParams.append('description', editedDescription);
      }

      if (editedStartDate !== '') {
        bodyParams.append('releaseDate', editedStartDate);
      }

      const queryParams = new URLSearchParams({
        endpoint: `events/${selectedMovie.id}`,
        apikey: session.apiKey,
        siteid: selectedSiteId.toString()
      });

      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/api-proxy`;

      const response = await fetch(`${apiUrl}?${queryParams.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString()
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      toast.success('Änderungen erfolgreich gespeichert');
      setIsDialogOpen(false);

      const updatedMovie = {
        ...selectedMovie,
        description: editedDescription || selectedMovie.description,
        startDate: editedStartDate || selectedMovie.startDate
      };

      if (selectedMovie.isCurrentlyShowing) {
        setCurrentMovies(prev =>
          prev.map(m => m.id === selectedMovie.id ? updatedMovie : m)
        );
      } else {
        setUpcomingMovies(prev =>
          prev.map(m => m.id === selectedMovie.id ? updatedMovie : m)
        );
      }
    } catch (err) {
      console.error('Failed to save movie:', err);
      toast.error(err instanceof Error ? err.message : 'Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder-movies.png';
  };

  const MovieGrid = ({ movies }: { movies: Movie[] }) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
      {movies.map((movie) => (
        <div
          key={movie.id}
          onClick={() => handleMovieClick(movie)}
          className="cursor-pointer group"
        >
          <div className="relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              onError={handleImageError}
              className="w-full h-auto aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
              <p className="text-white text-xs font-semibold line-clamp-2">
                {movie.title}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Filmbeschreibungen</h1>
        <p className="text-muted-foreground mt-2">
          Bearbeiten Sie Filmbeschreibungen und Startdaten
        </p>
      </div>

      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="current">Bereits im Programm</TabsTrigger>
          <TabsTrigger value="upcoming">Bald im Kino</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              type="text"
              placeholder="Filme durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="current" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="animate-spin text-primary" size={32} />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          ) : filteredCurrentMovies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Keine Filme gefunden</p>
            </div>
          ) : (
            <MovieGrid movies={filteredCurrentMovies} />
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="animate-spin text-primary" size={32} />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          ) : filteredUpcomingMovies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Keine Filme gefunden</p>
            </div>
          ) : (
            <MovieGrid movies={filteredUpcomingMovies} />
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedMovie?.title}</DialogTitle>
            <DialogDescription className="text-sm">
              Geben Sie die neue Filmbeschreibung im Textfeld ein oder legen Sie ein individuelles Startdatum fest.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Filmbeschreibung</Label>
              <Textarea
                id="description"
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={12}
                className="resize-y min-h-[200px]"
                placeholder="Filmbeschreibung eingeben..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Bundesstart/Individueller Start</Label>
              <Input
                id="startDate"
                type="date"
                value={editedStartDate}
                onChange={(e) => setEditedStartDate(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Speichern...
                </>
              ) : (
                'Speichern'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
