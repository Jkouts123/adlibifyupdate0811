import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button-variants';
import { Sparkles, Video, Zap, Users, Play } from 'lucide-react';
import heroImage from '@/assets/hero-background.jpg';
import productAdVideo from '@/assets/Hemp oil.mp4';
import serviceAdVideo from '@/assets/urban garden ad.mp4';
import softwareAdVideo from '@/assets/ReckonAd.mp4';
import mobileAppVideo from '@/assets/Tradify App.mp4';

// Updated video examples with more appropriate descriptive videos for each category
const videoExamples = [
  {
    id: 'product-ad',
    title: 'Product Advertisement',
    description: 'Showcase your products with dynamic visuals and compelling storytelling',
    videoUrl: productAdVideo,
    duration: '10s',
    category: 'product-ad'
  },
  {
    id: 'mobile-app',
    title: 'Mobile App Advertisement',
    description: 'Highlight your mobile app with stunning visuals and expert storytelling',
    videoUrl: mobileAppVideo,
    duration: '11s',
    category: 'mobile-app'
  },
  {
    id: 'home-service',
    title: 'Home Service Business',
    description: 'Expertly crafted home service business videos that attract customers',
    videoUrl: serviceAdVideo,
    duration: '12s',
    category: 'home-service'
  },
  {
    id: 'software-ad',
    title: 'Software Advertisement',
    description: 'Demonstrate your software features with clean UI walkthroughs',
    videoUrl: softwareAdVideo,
    duration: '11s',
    category: 'software-ad'
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Professional video production"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-luxury">
            <Sparkles className="h-4 w-4 text-primary animate-glow-pulse" />
            <span className="text-sm font-semibold">AI-Powered Video Generation</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-display font-bold leading-tight">
            Create Stunning Videos
            <br />
            <span className="text-primary font-cursive">In Seconds</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Generate professional UGC, service, and software videos with our luxury AI platform
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/studio">
              <Button variant="luxury" size="xl" className="group bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                Start Creating
                <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline-gold" size="xl" onClick={() =>
              document.getElementById("examples").scrollIntoView({ behavior: "smooth" })
            }>
              View Examples
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold">
              Three Powerful Workflows
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional video generation tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-luxury p-8 space-y-4 transition-all hover:-translate-y-2 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold">Product Advertisement</h3>
              <p className="text-muted-foreground">
                Create compelling product showcase videos that drive conversions
              </p>
            </div>

            <div className="glass-luxury p-8 space-y-4 transition-all hover:-translate-y-2 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold">Service Advertisement</h3>
              <p className="text-muted-foreground">
                Professional service-style videos that build trust and showcase your expertise
              </p>
            </div>

            <div className="glass-luxury p-8 space-y-4 transition-all hover:-translate-y-2 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold">Software Advertisement</h3>
              <p className="text-muted-foreground">
                Sleek software walkthroughs and UI demonstrations that impress
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Videos Showcase */}
      <section className="py-24 px-4 bg-background/50" id='examples'>
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold">
              Professional Video Examples
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See the quality and style of videos you can create
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {videoExamples.map((example) => (
              <div
                key={example.id}
                className="group glass-luxury rounded-xl overflow-hidden transition-all hover:-translate-y-2"
              >
                <div className="relative aspect-video overflow-hidden">
                  {/* Use imported video file */}
                  <video
                    src={example.videoUrl}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
                      <Play className="h-8 w-8 text-primary ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-display font-semibold text-lg">{example.title}</h3>
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{example.duration}</span>
                    <span className="capitalize">{example.category.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="glass-luxury p-12 md:p-16 text-center space-y-8 rounded-2xl">
            <h2 className="text-4xl md:text-6xl font-display font-bold">
              Ready to Transform Your Content?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with free credits when you sign up today
            </p>
            <Link to="/studio">
              <Button variant="luxury" size="xl" className='mt-8 bg-gradient-to-r from-purple-500 to-blue-600 text-white'>
                Get Started Now
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}