
import { Button } from '@/components/ui/button';
import { ArrowDown, Search, Users, Award } from 'lucide-react';

const Hero = () => {
  const scrollToCategories = () => {
    const element = document.querySelector('[data-scroll-target="categories"]');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-24 pb-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-white/30 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] [background-size:24px_24px]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Finn de beste{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            leverandørene
          </span>{' '}
          i Norge
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Sammenlign priser og tjenester fra hundrevis av leverandører innen strøm, mobil, internett, forsikring og mer
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          <div className="flex items-center space-x-2 text-gray-700">
            <Search className="h-5 w-5 text-blue-500" />
            <span className="font-medium">500+ leverandører</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <Users className="h-5 w-5 text-green-500" />
            <span className="font-medium">1M+ sammenligninger</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <Award className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Gratis å bruke</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Button 
            size="lg" 
            onClick={scrollToCategories}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start sammenligning
            <ArrowDown className="ml-2 h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-2 border-gray-300 hover:border-blue-500 px-8 py-3 text-lg font-medium"
          >
            Lær mer
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Anbefalt av:</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-gray-400 font-medium">Finansavisen</div>
            <div className="text-gray-400 font-medium">E24</div>
            <div className="text-gray-400 font-medium">TV2</div>
            <div className="text-gray-400 font-medium">NRK</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
