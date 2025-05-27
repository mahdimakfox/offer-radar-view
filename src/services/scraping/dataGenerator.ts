
interface ProviderEntry {
  category: string;
  name: string;
  url: string;
}

export const dataGenerator = {
  // Generate fallback description
  generateFallbackDescription(provider: ProviderEntry): string {
    const categoryDescriptions: Record<string, string> = {
      strom: 'strømleveranse',
      mobil: 'mobilabonnement',
      internett: 'bredbåndstjenester',
      forsikring: 'forsikringstjenester',
      bank: 'banktjenester',
      boligalarm: 'sikkerhetstjenester'
    };

    const service = categoryDescriptions[provider.category] || provider.category;
    return `${provider.name} tilbyr ${service} med konkurransedyktige priser og god kundeservice. Etablert leverandør i det norske markedet.`;
  },

  // Generate realistic price based on category
  generateRealisticPrice(category: string): number {
    const priceRanges: Record<string, [number, number]> = {
      strom: [300, 800],
      mobil: [199, 899],
      internett: [299, 799],
      forsikring: [1500, 4500],
      bank: [0, 299],
      boligalarm: [199, 599]
    };
    
    const [min, max] = priceRanges[category.toLowerCase()] || [100, 500];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Generate realistic rating
  generateRealisticRating(): number {
    return Math.round((3.0 + Math.random() * 2.0) * 10) / 10;
  },

  // Generate category-specific pros and cons
  generateCategoryFeatures(category: string): { pros: string[], cons: string[] } {
    const categoryFeatures: Record<string, { pros: string[], cons: string[] }> = {
      strom: {
        pros: ['Grønn energi', 'Fast pris', 'God kundeservice', 'Enkel app'],
        cons: ['Bindingstid', 'Oppsettsgebyr', 'Begrenset fleksibilitet']
      },
      mobil: {
        pros: ['Høy hastighet', 'God dekning', 'Fri tale/SMS', 'EU-roaming inkludert'],
        cons: ['Databegrensning', 'Bindingstid', 'Ekstra kostnader']
      },
      internett: {
        pros: ['Høy hastighet', 'Stabil forbindelse', 'Fri installasjon', 'WiFi inkludert'],
        cons: ['Begrenset tilgjengelighet', 'Oppsettsgebyr', 'Bindingstid']
      },
      forsikring: {
        pros: ['Omfattende dekning', 'Rask saksbehandling', 'God kundeservice', 'Familierabatt'],
        cons: ['Egenandel', 'Ventetid', 'Begrensninger']
      },
      bank: {
        pros: ['Konkurransedyktig rente', 'God app', 'Fri nettbank', 'Personlig rådgiver'],
        cons: ['Gebyrer', 'Krav til inntekt', 'Bindingstid']
      },
      boligalarm: {
        pros: ['24/7 overvåking', 'Mobil app', 'Rask respons', 'Enkel installasjon'],
        cons: ['Månedlig kostnad', 'Bindingstid', 'Installasjonskrav']
      }
    };

    return categoryFeatures[category.toLowerCase()] || {
      pros: ['Kvalitetstjenester', 'Konkurransedyktige priser', 'God kundeservice'],
      cons: ['Kan ha bindingstid', 'Begrenset tilgjengelighet']
    };
  }
};
