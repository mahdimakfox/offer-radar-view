
import { Card } from '@/components/ui/card';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-16 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Sammenlign.no</h3>
            <p className="text-gray-300 mb-4">
              Norges ledende sammenligningstjeneste for strøm, forsikring, bank og telekom.
            </p>
            <p className="text-gray-400 text-sm">
              © 2024 Sammenlign.no. Alle rettigheter reservert.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Kategorier</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white">Strøm</a></li>
              <li><a href="#" className="hover:text-white">Forsikring</a></li>
              <li><a href="#" className="hover:text-white">Bank</a></li>
              <li><a href="#" className="hover:text-white">Mobil</a></li>
              <li><a href="#" className="hover:text-white">Bredbånd</a></li>
              <li><a href="#" className="hover:text-white">Boligalarm</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">For leverandører</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white">Bli leverandør</a></li>
              <li><a href="#" className="hover:text-white">Partnere med oss</a></li>
              <li><a href="#" className="hover:text-white">API-dokumentasjon</a></li>
              <li><a href="#" className="hover:text-white">Kontakt oss</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Kundeservice</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white">Ofte stilte spørsmål</a></li>
              <li><a href="#" className="hover:text-white">Personvern</a></li>
              <li><a href="#" className="hover:text-white">Vilkår og betingelser</a></li>
              <li><a href="#" className="hover:text-white">Kontakt support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p>Sammenlign.no samler tilbud fra over 100+ leverandører og hjelper nordmenn med å spare penger.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
