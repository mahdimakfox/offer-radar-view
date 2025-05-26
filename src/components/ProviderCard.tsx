
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data for different categories with 20+ providers each
const providersData = {
  strom: [
    { id: 1, name: 'Hafslund', price: 89.5, logo: 'H', rating: 4.2, url: '#', description: 'Grønn strøm fra Hafslund' },
    { id: 2, name: 'Fortum', price: 92.3, logo: 'F', rating: 4.1, url: '#', description: 'Klimavennlig energi' },
    { id: 3, name: 'Tibber', price: 88.1, logo: 'T', rating: 4.5, url: '#', description: 'Smart strøm med app' },
    { id: 4, name: 'Agder Energi', price: 91.2, logo: 'AE', rating: 4.0, url: '#', description: 'Lokal energileverandør' },
    { id: 5, name: 'Lyse', price: 90.8, logo: 'L', rating: 4.3, url: '#', description: 'Vestlandsk energi' },
    { id: 6, name: 'Nordpool', price: 87.9, logo: 'NP', rating: 3.9, url: '#', description: 'Variabel strømpris' },
    { id: 7, name: 'Fjordkraft', price: 93.2, logo: 'FK', rating: 4.1, url: '#', description: 'Kraft fra fjordene' },
    { id: 8, name: 'Motkraft', price: 85.6, logo: 'MK', rating: 4.4, url: '#', description: 'Billig strøm' },
    { id: 9, name: 'Gudbrandsdal Energi', price: 91.7, logo: 'GE', rating: 4.0, url: '#', description: 'Regional energi' },
    { id: 10, name: 'Eidsiva', price: 89.9, logo: 'E', rating: 4.2, url: '#', description: 'Lokal strømleverandør' },
    { id: 11, name: 'BKK', price: 90.1, logo: 'BKK', rating: 4.1, url: '#', description: 'Bergen energi' },
    { id: 12, name: 'Tensio', price: 92.5, logo: 'TE', rating: 3.8, url: '#', description: 'Østlandet energi' },
    { id: 13, name: 'Troms Kraft', price: 88.7, logo: 'TK', rating: 4.3, url: '#', description: 'Nord-Norge kraft' },
    { id: 14, name: 'Ishavskraft', price: 89.3, logo: 'IK', rating: 4.0, url: '#', description: 'Arktisk energi' },
    { id: 15, name: 'Helgeland Kraft', price: 91.1, logo: 'HK', rating: 4.2, url: '#', description: 'Nordlandsk kraft' },
    { id: 16, name: 'Varanger Kraft', price: 87.2, logo: 'VK', rating: 4.1, url: '#', description: 'Finnmark energi' },
    { id: 17, name: 'Salten Kraftsamband', price: 90.6, logo: 'SK', rating: 3.9, url: '#', description: 'Salten region' },
    { id: 18, name: 'Repvåg Kraft', price: 88.9, logo: 'RK', rating: 4.0, url: '#', description: 'Lokalt kraftselskap' },
    { id: 19, name: 'Narvik Energi', price: 92.1, logo: 'NE', rating: 4.2, url: '#', description: 'Narvik strøm' },
    { id: 20, name: 'Bodø Energi', price: 89.8, logo: 'BE', rating: 4.1, url: '#', description: 'Bodø kraft' },
    { id: 21, name: 'Alta Kraftlag', price: 86.5, logo: 'AK', rating: 4.3, url: '#', description: 'Alta energi' },
    { id: 22, name: 'Hammerfest Energi', price: 91.4, logo: 'HE', rating: 3.8, url: '#', description: 'Hammerfest kraft' },
    { id: 23, name: 'Vadsø Kraftverk', price: 90.2, logo: 'VKV', rating: 4.0, url: '#', description: 'Øst-Finnmark' },
    { id: 24, name: 'Kvalsund Kraft', price: 88.3, logo: 'KK', rating: 4.1, url: '#', description: 'Vest-Finnmark' }
  ],
  forsikring: [
    { id: 25, name: 'If Skadeforsikring', price: 299, logo: 'If', rating: 4.3, url: '#', description: 'Billig bilforsikring' },
    { id: 26, name: 'Tryg', price: 315, logo: 'TR', rating: 4.1, url: '#', description: 'Trygg forsikring' },
    { id: 27, name: 'Gjensidige', price: 289, logo: 'GJ', rating: 4.4, url: '#', description: 'Gjensidig forsikring' },
    { id: 28, name: 'SpareBank 1', price: 325, logo: 'SB1', rating: 4.0, url: '#', description: 'Bank og forsikring' },
    { id: 29, name: 'Fremtind', price: 309, logo: 'FR', rating: 4.2, url: '#', description: 'Moderne forsikring' },
    { id: 30, name: 'Codan', price: 298, logo: 'CO', rating: 4.1, url: '#', description: 'Digital forsikring' },
    { id: 31, name: 'Storebrand', price: 335, logo: 'ST', rating: 3.9, url: '#', description: 'Pensjon og forsikring' },
    { id: 32, name: 'KLP', price: 295, logo: 'KLP', rating: 4.3, url: '#', description: 'Kommunal forsikring' },
    { id: 33, name: 'Vardia', price: 318, logo: 'VA', rating: 4.0, url: '#', description: 'Billige premier' },
    { id: 34, name: 'Eika Forsikring', price: 292, logo: 'EI', rating: 4.2, url: '#', description: 'Lokal forsikring' },
    { id: 35, name: 'Lærertrygd', price: 301, logo: 'LT', rating: 4.1, url: '#', description: 'For lærere' },
    { id: 36, name: 'Protector', price: 288, logo: 'PR', rating: 4.4, url: '#', description: 'Konkurransedyktig' },
    { id: 37, name: 'Aktiv Forsikring', price: 312, logo: 'AF', rating: 3.8, url: '#', description: 'Aktiv livsstil' },
    { id: 38, name: 'Terra', price: 306, logo: 'TE', rating: 4.0, url: '#', description: 'Landbruk fokus' },
    { id: 39, name: 'Jernbanepersonalets', price: 297, logo: 'JP', rating: 4.2, url: '#', description: 'For jernbane' },
    { id: 40, name: 'Pensjonistforbundet', price: 285, logo: 'PF', rating: 4.3, url: '#', description: 'Pensjonister' },
    { id: 41, name: 'Akademikerne', price: 319, logo: 'AK', rating: 4.1, url: '#', description: 'For akademikere' },
    { id: 42, name: 'Frende', price: 303, logo: 'FR', rating: 3.9, url: '#', description: 'Vestlandsk forsikring' },
    { id: 43, name: 'Møre Forsikring', price: 294, logo: 'MF', rating: 4.2, url: '#', description: 'Møre og Romsdal' },
    { id: 44, name: 'Haugesund Sparebank', price: 308, logo: 'HS', rating: 4.0, url: '#', description: 'Lokal sparebank' },
    { id: 45, name: 'Surnadal Sparebank', price: 291, logo: 'SS', rating: 4.1, url: '#', description: 'Regional bank' },
    { id: 46, name: 'Bien Sparebank', price: 314, logo: 'BS', rating: 3.8, url: '#', description: 'Kristiansand' }
  ],
  bank: [
    { id: 47, name: 'DNB', price: 0, logo: 'DNB', rating: 4.1, url: '#', description: 'Norges største bank' },
    { id: 48, name: 'Nordea', price: 0, logo: 'NO', rating: 3.9, url: '#', description: 'Nordisk bank' },
    { id: 49, name: 'SpareBank 1', price: 0, logo: 'SB1', rating: 4.2, url: '#', description: 'Lokale sparebanker' },
    { id: 50, name: 'Handelsbanken', price: 0, logo: 'HB', rating: 4.3, url: '#', description: 'Svensk kvalitetsbank' },
    { id: 51, name: 'Danske Bank', price: 0, logo: 'DB', rating: 3.8, url: '#', description: 'Dansk storbank' },
    { id: 52, name: 'Santander', price: 0, logo: 'SA', rating: 4.0, url: '#', description: 'Spansk global bank' },
    { id: 53, name: 'OBOS Bank', price: 0, logo: 'OB', rating: 4.4, url: '#', description: 'Boligfokusert bank' },
    { id: 54, name: 'Bank Norwegian', price: 0, logo: 'BN', rating: 4.1, url: '#', description: 'Digital bank' },
    { id: 55, name: 'Komplett Bank', price: 0, logo: 'KB', rating: 4.2, url: '#', description: 'Online bank' },
    { id: 56, name: 'Sbanken', price: 0, logo: 'SB', rating: 4.5, url: '#', description: 'Innovativ nettbank' },
    { id: 57, name: 'Kultur Sparebank', price: 0, logo: 'KS', rating: 4.0, url: '#', description: 'Kulturelt fokus' },
    { id: 58, name: 'Sparebanken Vest', price: 0, logo: 'SV', rating: 4.1, url: '#', description: 'Vestlandsk bank' },
    { id: 59, name: 'Sparebanken Øst', price: 0, logo: 'SØ', rating: 4.0, url: '#', description: 'Østlandsk bank' },
    { id: 60, name: 'Sparebanken Nord', price: 0, logo: 'SN', rating: 4.2, url: '#', description: 'Nord-Norge bank' },
    { id: 61, name: 'Sparebanken Møre', price: 0, logo: 'SM', rating: 4.1, url: '#', description: 'Møre og Romsdal' },
    { id: 62, name: 'BN Bank', price: 0, logo: 'BNB', rating: 3.9, url: '#', description: 'Bedriftsbank' },
    { id: 63, name: 'Lofoten Sparebank', price: 0, logo: 'LS', rating: 4.3, url: '#', description: 'Lofoten region' },
    { id: 64, name: 'Hjelmeland Sparebank', price: 0, logo: 'HS', rating: 4.0, url: '#', description: 'Rogaland bank' },
    { id: 65, name: 'Etne Sparebank', price: 0, logo: 'ES', rating: 4.1, url: '#', description: 'Hordaland bank' },
    { id: 66, name: 'Fornebu Sparebank', price: 0, logo: 'FS', rating: 4.2, url: '#', description: 'Oslo vest' },
    { id: 67, name: 'Lillestrøm Sparebank', price: 0, logo: 'LS', rating: 3.8, url: '#', description: 'Romerike bank' },
    { id: 68, name: 'Tysnes Sparebank', price: 0, logo: 'TS', rating: 4.0, url: '#', description: 'Øybank' },
    { id: 69, name: 'Aurland Sparebank', price: 0, logo: 'AS', rating: 4.1, url: '#', description: 'Sogn bank' },
    { id: 70, name: 'Voss Sparebank', price: 0, logo: 'VS', rating: 4.2, url: '#', description: 'Voss region' }
  ],
  mobil: [
    { id: 71, name: 'Telenor', price: 399, logo: 'TN', rating: 4.2, url: '#', description: 'Norges største mobiloperatør' },
    { id: 72, name: 'Telia', price: 379, logo: 'TE', rating: 4.0, url: '#', description: 'Svensk telekom' },
    { id: 73, name: 'Ice', price: 349, logo: 'ICE', rating: 4.1, url: '#', description: 'Ung og frisk' },
    { id: 74, name: 'Phonero', price: 299, logo: 'PH', rating: 3.9, url: '#', description: 'Rimelig mobil' },
    { id: 75, name: 'MyCall', price: 289, logo: 'MC', rating: 4.3, url: '#', description: 'Billig og god' },
    { id: 76, name: 'Lycamobile', price: 199, logo: 'LY', rating: 3.8, url: '#', description: 'Internasjonalt' },
    { id: 77, name: 'OneCall', price: 319, logo: 'OC', rating: 4.1, url: '#', description: 'Ett nummer' },
    { id: 78, name: 'Lebara', price: 249, logo: 'LE', rating: 3.7, url: '#', description: 'Innvandrer-fokus' },
    { id: 79, name: 'Talkmore', price: 329, logo: 'TM', rating: 4.0, url: '#', description: 'Snakk mer' },
    { id: 80, name: 'Chess', price: 359, logo: 'CH', rating: 4.2, url: '#', description: 'Strategisk mobil' },
    { id: 81, name: 'Happybytes', price: 279, logo: 'HB', rating: 4.1, url: '#', description: 'Glade bytes' },
    { id: 82, name: 'Ventelo', price: 339, logo: 'VE', rating: 3.9, url: '#', description: 'Bedriftsfokus' },
    { id: 83, name: 'Network Norway', price: 389, logo: 'NN', rating: 4.0, url: '#', description: 'Norsk nettverk' },
    { id: 84, name: 'Mob24', price: 269, logo: 'M24', rating: 3.8, url: '#', description: '24/7 mobil' },
    { id: 85, name: 'Flexfone', price: 349, logo: 'FL', rating: 4.1, url: '#', description: 'Fleksibel telefon' },
    { id: 86, name: 'Telipol', price: 299, logo: 'TP', rating: 3.9, url: '#', description: 'Polsk fokus' },
    { id: 87, name: 'Greencom', price: 319, logo: 'GR', rating: 4.0, url: '#', description: 'Grønn kommunikasjon' },
    { id: 88, name: 'Mobile Fun', price: 259, logo: 'MF', rating: 4.2, url: '#', description: 'Morsom mobil' },
    { id: 89, name: 'NetCom+', price: 369, logo: 'NC', rating: 3.8, url: '#', description: 'NetCom oppfølger' },
    { id: 90, name: 'Smartcom', price: 309, logo: 'SC', rating: 4.1, url: '#', description: 'Smart kommunikasjon' },
    { id: 91, name: 'TeleNor Light', price: 229, logo: 'TNL', rating: 3.7, url: '#', description: 'Lett versjon' }
  ],
  bredband: [
    { id: 92, name: 'Telenor Bredbånd', price: 699, logo: 'TNB', rating: 4.1, url: '#', description: 'Fiber og ADSL' },
    { id: 93, name: 'Telia Bredbånd', price: 679, logo: 'TEB', rating: 4.0, url: '#', description: 'Rask internett' },
    { id: 94, name: 'Altibox', price: 599, logo: 'AL', rating: 4.4, url: '#', description: 'Lyshastighet' },
    { id: 95, name: 'NextGenTel', price: 649, logo: 'NG', rating: 4.2, url: '#', description: 'Neste generasjon' },
    { id: 96, name: 'Get', price: 759, logo: 'GET', rating: 3.9, url: '#', description: 'TV og internett' },
    { id: 97, name: 'Ice Net', price: 559, logo: 'IN', rating: 4.1, url: '#', description: 'Is-kald hastighet' },
    { id: 98, name: 'GlobalConnect', price: 689, logo: 'GC', rating: 4.0, url: '#', description: 'Global tilkobling' },
    { id: 99, name: 'Broadnet', price: 629, logo: 'BN', rating: 3.8, url: '#', description: 'Bredt nettverk' },
    { id: 100, name: 'Nordialog', price: 719, logo: 'ND', rating: 4.1, url: '#', description: 'Nord-dialog' },
    { id: 101, name: 'Phonect', price: 569, logo: 'PC', rating: 4.2, url: '#', description: 'Telefon og internett' },
    { id: 102, name: 'Com4', price: 699, logo: 'C4', rating: 3.9, url: '#', description: 'Kommunikasjon 4.0' },
    { id: 103, name: 'Ventelo Fiber', price: 749, logo: 'VF', rating: 4.0, url: '#', description: 'Fiber fra Ventelo' },
    { id: 104, name: 'Lynet', price: 589, logo: 'LY', rating: 4.3, url: '#', description: 'Lyn-rask' },
    { id: 105, name: 'Bredbåndsfylket', price: 639, logo: 'BF', rating: 4.1, url: '#', description: 'Fylkes-bredbånd' },
    { id: 106, name: 'OpenNet', price: 599, logo: 'ON', rating: 4.2, url: '#', description: 'Åpent nettverk' },
    { id: 107, name: 'Infratek', price: 669, logo: 'IF', rating: 3.8, url: '#', description: 'Infrastruktur' },
    { id: 108, name: 'Hafslund Fiber', price: 729, logo: 'HF', rating: 4.0, url: '#', description: 'Hafslund fiber' },
    { id: 109, name: 'Lyse Fiber', price: 619, logo: 'LF', rating: 4.3, url: '#', description: 'Lyse-fiber' },
    { id: 110, name: 'BKK Fiber', price: 689, logo: 'BF', rating: 4.1, url: '#', description: 'Bergen fiber' },
    { id: 111, name: 'Troms Kraft Fiber', price: 659, logo: 'TKF', rating: 4.2, url: '#', description: 'Nord-fiber' },
    { id: 112, name: 'Eidsiva Fiber', price: 699, logo: 'EF', rating: 3.9, url: '#', description: 'Eidsiva fiber' },
    { id: 113, name: 'More Fiber', price: 579, logo: 'MF', rating: 4.1, url: '#', description: 'Mer fiber' }
  ],
  alarm: [
    { id: 114, name: 'Sector Alarm', price: 349, logo: 'SA', rating: 4.3, url: '#', description: 'Markedsleder' },
    { id: 115, name: 'Verisure', price: 399, logo: 'VE', rating: 4.1, url: '#', description: 'Europeisk leder' },
    { id: 116, name: 'Nokas', price: 329, logo: 'NO', rating: 4.2, url: '#', description: 'Norsk sikkerhet' },
    { id: 117, name: 'G4S', price: 369, logo: 'G4S', rating: 4.0, url: '#', description: 'Global sikkerhet' },
    { id: 118, name: 'SafeGuard', price: 289, logo: 'SG', rating: 3.9, url: '#', description: 'Trygg vakt' },
    { id: 119, name: 'Securitas', price: 359, logo: 'SE', rating: 4.1, url: '#', description: 'Svensk sikkerhet' },
    { id: 120, name: 'HomeSafe', price: 269, logo: 'HS', rating: 4.2, url: '#', description: 'Hjemmesikkerhet' },
    { id: 121, name: 'AlarmCenter', price: 319, logo: 'AC', rating: 4.0, url: '#', description: 'Alarm-senter' },
    { id: 122, name: 'TrygghetsAlarm', price: 299, logo: 'TA', rating: 4.1, url: '#', description: 'Trygghet først' },
    { id: 123, name: 'ByggeAlarm', price: 339, logo: 'BA', rating: 3.8, url: '#', description: 'Byggealarm' },
    { id: 124, name: 'WatchGuard', price: 379, logo: 'WG', rating: 4.2, url: '#', description: 'Vakt-guard' },
    { id: 125, name: 'SmartAlarm', price: 259, logo: 'SM', rating: 4.3, url: '#', description: 'Smart alarm' },
    { id: 126, name: 'ProSecure', price: 389, logo: 'PS', rating: 3.9, url: '#', description: 'Profesjonell sikring' },
    { id: 127, name: 'HomeGuard', price: 309, logo: 'HG', rating: 4.1, url: '#', description: 'Hjemme-vakt' },
    { id: 128, name: 'SafetyFirst', price: 279, logo: 'SF', rating: 4.0, url: '#', description: 'Sikkerhet først' },
    { id: 129, name: 'AlarmTech', price: 349, logo: 'AT', rating: 4.2, url: '#', description: 'Alarm-teknologi' },
    { id: 130, name: 'SecureHome', price: 329, logo: 'SH', rating: 3.8, url: '#', description: 'Sikre hjem' },
    { id: 131, name: 'GuardianAlarm', price: 359, logo: 'GA', rating: 4.1, url: '#', description: 'Guardian alarm' }
  ]
};

interface ProviderCardProps {
  category: string;
  searchTerm: string;
  onSelect: (provider: any) => void;
  selectedProviders: any[];
}

const ProviderCard = ({ category, searchTerm, onSelect, selectedProviders }: ProviderCardProps) => {
  const [sortBy, setSortBy] = useState('price');
  
  const providers = providersData[category] || [];
  
  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return a.name.localeCompare(b.name);
  });

  const formatPrice = (price: number, category: string) => {
    if (category === 'bank') return 'Gratis';
    return `${price} kr/mnd`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {sortedProviders.length} leverandører funnet
        </h2>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="price">Sorter etter pris</option>
          <option value="rating">Sorter etter rating</option>
          <option value="name">Sorter etter navn</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProviders.map((provider) => {
          const isSelected = selectedProviders.find(p => p.id === provider.id);
          
          return (
            <Card key={provider.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                    {provider.logo}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{provider.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm text-gray-600">{provider.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(provider.price, category)}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{provider.description}</p>
              
              <div className="flex space-x-2">
                <Button 
                  className="flex-1" 
                  onClick={() => window.open(provider.url, '_blank')}
                >
                  Gå til tilbud
                </Button>
                <Button 
                  variant={isSelected ? "secondary" : "outline"}
                  onClick={() => onSelect(provider)}
                  disabled={selectedProviders.length >= 4 && !isSelected}
                >
                  {isSelected ? 'Valgt' : 'Sammenlign'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProviderCard;
