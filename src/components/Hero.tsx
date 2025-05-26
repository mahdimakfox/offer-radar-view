
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">
          Sammenlign og spar tusenvis av kroner
        </h1>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Finn de beste tilbudene innen strøm, forsikring, bank, mobil og bredbånd. 
          Vi samler tilbud fra over 100+ leverandører og hjelper deg å spare penger.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg">
            Sammenlign nå
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg">
            Les mer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
