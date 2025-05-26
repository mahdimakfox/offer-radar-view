
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Heart, Settings } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchProfile();
    fetchFavorites();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setFullName(data.full_name || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profil oppdatert!');
      setProfile({ ...profile, full_name: fullName });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Kunne ikke oppdatere profil');
    } finally {
      setUpdating(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      setFavorites(favorites.filter(f => f.id !== favoriteId));
      toast.success('Fjernet fra favoritter');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Kunne ikke fjerne favoritt');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Du er nå logget ut');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Feil ved utlogging');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">Laster profil...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{profile?.full_name || 'Navn ikke satt'}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              
              <form onSubmit={updateProfile} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Fullt navn
                  </label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Skriv inn ditt fulle navn"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={updating}
                >
                  {updating ? 'Oppdaterer...' : 'Oppdater profil'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t">
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  className="w-full text-red-600 border-red-600 hover:bg-red-50"
                >
                  Logg ut
                </Button>
              </div>
            </Card>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <Heart className="w-6 h-6 text-red-500 mr-2" />
                <h2 className="text-2xl font-semibold">Mine favoritter</h2>
                <Badge variant="secondary" className="ml-2">
                  {favorites.length}
                </Badge>
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Ingen favoritter ennå
                  </h3>
                  <p className="text-gray-500">
                    Legg til leverandører i favorittene dine for å sammenligne dem senere.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.map((favorite) => (
                    <div 
                      key={favorite.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-3">
                          {favorite.category}
                        </Badge>
                        <div>
                          <p className="font-medium">Leverandør #{favorite.provider_id}</p>
                          <p className="text-sm text-gray-600">
                            Lagt til {new Date(favorite.created_at).toLocaleDateString('no-NO')}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeFavorite(favorite.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Fjern
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
