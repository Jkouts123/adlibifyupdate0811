import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button-variants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, RefreshCw, Sparkles, Clock, Trash2, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Generation {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  template_id: string;
  template_name: string;
  template_category: string;
  workflow_type: string;
  status: string;
  credits_used: number;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function History() {
  const [history, setHistory] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchGenerations();
  }, [user]);

  const fetchGenerations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (videoUrl: string, title: string) => {
    try {
      toast.info('Preparing download...');

      // Create a more descriptive filename
      const fileExtension = videoUrl.split('.').pop() || 'mp4';
      const filename = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_adlibify.${fileExtension}`;

      // Fetch the video as a blob
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();

      // Create object URL, then revoke it after download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Download started!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again.');
    }
  };

  const handlePlayVideo = (videoUrl: string, title: string) => {
    setCurrentVideoUrl(videoUrl);
    setCurrentVideoTitle(title);
    setVideoModalOpen(true);
  };

  const handleDelete = async (generationId: string, title: string) => {
    try {
      // Confirm with user before deleting
      if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
        return;
      }

      // Delete the generation record
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', generationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Update the local state to remove the deleted item
      setHistory(prev => prev.filter(item => item.id !== generationId));

      toast.success('Generation deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete generation. Please try again.');
    }
  };

  const handleReRun = (generation: Generation) => {
    // For now, just log the action
    console.log('Re-run generation:', generation);
    // In a real implementation, you would navigate to the studio with the generation data
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center space-y-2 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-display font-bold">History & Generations</h1>
        <p className="text-xl text-muted-foreground">Track and manage your generations </p>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="w-full  glass-luxury h-auto p-1 mb-8">
          <TabsTrigger
            value="history"
            className="w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
          >
            Generation History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          {history.length === 0 ? (
            <div className="glass-luxury p-12 text-center space-y-4">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No generations yet. Start creating in the Studio!</p>
              <Link to="/studio">
                <Button variant="luxury">Go to Studio</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {history.map((item) => (
                <div key={item.id} className="glass-luxury p-6 transition-all hover:-translate-y-1">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Thumbnail/Video Preview */}
                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                      {item.video_url ? (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <span className="text-white text-xs">Video Generated</span>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">
                            {item.status === 'processing' ? 'Processing...' :
                              item.status === 'failed' ? 'Processing Failed' : 'No Video'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-display font-bold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description || 'No description'}</p>
                          {item.status === 'failed' && (
                            <p className="text-sm text-red-500 mt-1">Processing failed</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-primary">
                          <Sparkles className="h-4 w-4" />
                          <span>{item.credits_used} credit{item.credits_used !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full font-semibold ${item.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                            item.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                              item.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500' :
                                'bg-primary/10 text-primary'
                          }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex md:flex-col gap-2">
                      {item.status === 'completed' && item.video_url && (
                        <Button
                          variant="outline-gold"
                          size="sm"
                          onClick={() => handlePlayVideo(item.video_url!, item.title)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </Button>
                      )}

                      {item.status === 'completed' && (
                        <Button
                          variant="outline-gold"
                          size="sm"
                          disabled={!item.video_url}
                          onClick={() => item.video_url && handleDownload(item.video_url, item.title)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}


                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.title)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                      {/* <Button 
                        variant="glass" 
                        size="sm"
                        onClick={() => handleReRun(item)}
                      > 
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Re-run
                      </Button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Video Player Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{currentVideoTitle}</DialogTitle>
            <DialogDescription>Watch your generated video</DialogDescription>
          </DialogHeader>
          <div className="aspect-video w-full">
            {currentVideoUrl && (
              <video
                src={currentVideoUrl}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}