
# Fullstendig implementasjonsguide for Sammenlign.no

## Prosjektoversikt
Komplett sammenligningstjeneste med 20+ leverandører per kategori, live data, bruker/leverandørdashboard og full automatisering.

## 1. Database Schema (Supabase PostgreSQL)

### Hovedtabeller med relasjoner:

```sql
-- Kategorier (Strøm, Mobil, Forsikring osv.)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Leverandører (20+ per kategori)
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  fallback_label TEXT,
  description TEXT,
  organization_number TEXT UNIQUE,
  website_url TEXT,
  contact_email TEXT,
  rating FLOAT DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Tilbud (priser og produktinfo per leverandør)
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  price_unit TEXT DEFAULT 'kr/mnd',
  original_price NUMERIC(12, 2),
  offer_url TEXT NOT NULL,
  terms_conditions TEXT,
  valid_from DATE,
  valid_to DATE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Brukere (koblet til Supabase Auth)
CREATE TABLE users (
  auth_id UUID PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT DEFAULT 'user', -- 'user' | 'provider' | 'admin'
  favorites UUID[] DEFAULT '{}',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  newsletter_subscribed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Brukervurderinger
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(auth_id) ON DELETE SET NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  score INTEGER CHECK (score BETWEEN 1 AND 5),
  title TEXT,
  content TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now()
);

-- Prishistorikk og oppdateringer
CREATE TABLE price_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  old_price NUMERIC(12,2),
  new_price NUMERIC(12,2),
  change_percentage NUMERIC(5,2),
  source TEXT, -- 'webhook', 'api', 'scraping', 'manual'
  updated_by UUID REFERENCES users(auth_id),
  updated_at TIMESTAMP DEFAULT now()
);

-- Webhook-logging
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT,
  provider_id UUID REFERENCES providers(id),
  payload JSONB,
  response_status INTEGER,
  error_message TEXT,
  processed BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMP DEFAULT now()
);

-- Søkelogg for analytikk
CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(auth_id),
  search_term TEXT,
  category TEXT,
  filters JSONB,
  results_count INTEGER,
  clicked_offer_id UUID REFERENCES offers(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Email-kampanjer og notifikasjoner
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT, -- 'all', 'category_subscribers', 'price_alert_users'
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  total_sent INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);
```

### Row Level Security (RLS) Policies:

```sql
-- Aktivere RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Brukere kan kun se og oppdatere sine egne data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = auth_id);

-- Leverandører kan kun redigere egne tilbud
CREATE POLICY "Providers can manage own offers" ON offers FOR ALL USING (
  provider_id IN (
    SELECT id FROM providers WHERE id IN (
      SELECT provider_id FROM provider_users WHERE user_id = auth.uid()
    )
  )
);

-- Brukere kan kun skrive egne anmeldelser
CREATE POLICY "Users can create own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view approved reviews" ON reviews FOR SELECT USING (is_approved = TRUE);
```

## 2. API Design (Supabase REST + Edge Functions)

### REST Endepunkter:

#### Kategorier
- `GET /categories` - List alle kategorier
- `GET /categories/{id}/providers` - Leverandører per kategori

#### Leverandører
- `GET /providers` - List med paginering og filtrering
- `GET /providers/{id}` - Enkelt leverandør med tilbud
- `POST /providers` - Opprett (kun leverandør-rolle)
- `PUT /providers/{id}` - Oppdater (kun eier)

#### Tilbud
- `GET /offers` - Søk og filtrer tilbud
- `GET /offers/{id}` - Enkelt tilbud
- `POST /offers` - Opprett tilbud (leverandør)
- `PUT /offers/{id}` - Oppdater tilbud (leverandør)
- `DELETE /offers/{id}` - Deaktiver tilbud

#### Søk og filtrering
- `GET /search?q={term}&category={cat}&minPrice={min}&maxPrice={max}&rating={min_rating}&sort={field}`

#### Brukere og autentisering
- `POST /auth/signup` - Registrer bruker
- `POST /auth/login` - Logg inn
- `GET /users/profile` - Bruker profil
- `PUT /users/profile` - Oppdater profil
- `GET /users/favorites` - Brukerens favoritter
- `POST /users/favorites/{offer_id}` - Legg til favoritt

#### Anmeldelser
- `GET /reviews?provider_id={id}` - Anmeldelser for leverandør
- `POST /reviews` - Opprett anmeldelse (autentisert)
- `PUT /reviews/{id}` - Oppdater egen anmeldelse

## 3. Webhook System (Supabase Edge Functions)

### Edge Function: Prisoppdatering

```typescript
// supabase/functions/price-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    console.log('Webhook received:', payload)

    // Valider webhook signatur (hvis tilgjengelig)
    const signature = req.headers.get('x-webhook-signature')
    if (!validateSignature(payload, signature)) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Prosesser prisoppdatering
    const { offer_id, new_price, source, provider_id } = payload

    if (!offer_id || !new_price) {
      return new Response('Missing required fields', { status: 400 })
    }

    // Hent eksisterende tilbud
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('price, provider_id')
      .eq('id', offer_id)
      .single()

    if (offerError || !offer) {
      return new Response('Offer not found', { status: 404 })
    }

    const oldPrice = parseFloat(offer.price)
    const newPriceFloat = parseFloat(new_price)

    // Oppdater kun hvis pris har endret seg
    if (oldPrice !== newPriceFloat) {
      const changePercentage = ((newPriceFloat - oldPrice) / oldPrice) * 100

      // Oppdater tilbud
      await supabase
        .from('offers')
        .update({
          price: newPriceFloat,
          updated_at: new Date().toISOString()
        })
        .eq('id', offer_id)

      // Logg prisendring
      await supabase
        .from('price_updates')
        .insert({
          offer_id,
          old_price: oldPrice,
          new_price: newPriceFloat,
          change_percentage: changePercentage,
          source: source || 'webhook'
        })

      // Send notifikasjon til brukere som følger dette tilbudet
      await notifyPriceChange(supabase, offer_id, oldPrice, newPriceFloat)
    }

    // Logg webhook
    await supabase
      .from('webhook_logs')
      .insert({
        event_type: 'price_update',
        provider_id: offer.provider_id,
        payload,
        response_status: 200,
        processed: true
      })

    return new Response(
      JSON.stringify({ success: true, message: 'Price updated successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

function validateSignature(payload: any, signature: string | null): boolean {
  // Implementer webhook signatur validering
  // Eksempel med HMAC SHA256
  if (!signature) return false
  
  const secret = Deno.env.get('WEBHOOK_SECRET')
  if (!secret) return false
  
  // Valider signatur logikk her
  return true
}

async function notifyPriceChange(supabase: any, offerId: string, oldPrice: number, newPrice: number) {
  // Implementer notifikasjon til brukere som følger tilbudet
  // Send email, push notification, etc.
  console.log(`Price changed for offer ${offerId}: ${oldPrice} -> ${newPrice}`)
}
```

### Edge Function: Scraping Fallback

```typescript
// supabase/functions/scraping-fallback/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // Hent leverandører som trenger scraping
    const { data: providers } = await supabase
      .from('providers')
      .select('id, name, website_url')
      .eq('is_active', true)
      .is('last_scraped', null)
      .or('last_scraped.lt.' + new Date(Date.now() - 24*60*60*1000).toISOString())

    for (const provider of providers || []) {
      await scrapeProviderData(supabase, provider)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

async function scrapeProviderData(supabase: any, provider: any) {
  // Implementer scraping logikk her
  // Bruk Puppeteer eller lignende for å hente data
  console.log(`Scraping data for ${provider.name}`)
  
  // Eksempel: Oppdater provider med scraped data
  await supabase
    .from('providers')
    .update({ last_scraped: new Date().toISOString() })
    .eq('id', provider.id)
}
```

## 4. Frontend Komponenter (React/Next.js)

### Filstruktur:
```
src/
├── components/
│   ├── ui/              # Shadcn UI komponenter
│   ├── CategoryGrid.tsx
│   ├── ProviderCard.tsx
│   ├── ComparisonTable.tsx
│   ├── SearchFilter.tsx
│   ├── Hero.tsx
│   ├── Navigation.tsx
│   └── Footer.tsx
├── pages/
│   ├── index.tsx        # Hovedside
│   ├── category/[slug].tsx
│   ├── provider/[id].tsx
│   ├── compare.tsx
│   └── dashboard/
│       ├── user.tsx
│       └── provider.tsx
├── lib/
│   ├── supabase.ts
│   ├── utils.ts
│   └── types.ts
└── styles/
    └── globals.css
```

### SEO Implementering:

```typescript
// pages/category/[slug].tsx
import Head from 'next/head'
import { GetStaticProps, GetStaticPaths } from 'next'

export default function CategoryPage({ category, providers, offers }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${category.name} sammenligning`,
    "description": `Sammenlign ${providers.length} ${category.name.toLowerCase()} leverandører`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": offers.map((offer, index) => ({
        "@type": "Product",
        "position": index + 1,
        "name": offer.title,
        "brand": offer.provider.name,
        "offers": {
          "@type": "Offer",
          "price": offer.price,
          "priceCurrency": "NOK",
          "url": offer.offer_url
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": offer.provider.rating,
          "reviewCount": offer.provider.total_reviews
        }
      }))
    }
  }

  return (
    <>
      <Head>
        <title>{category.name} sammenligning - Sammenlign.no</title>
        <meta name="description" content={`Sammenlign ${providers.length} ${category.name.toLowerCase()} leverandører og spar penger`} />
        
        {/* OpenGraph */}
        <meta property="og:title" content={`${category.name} sammenligning`} />
        <meta property="og:description" content={`Sammenlign ${providers.length} leverandører`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://sammenlign.no/category/${category.slug}`} />
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      
      {/* Component content */}
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Generer paths for alle kategorier
  return {
    paths: [
      { params: { slug: 'strom' } },
      { params: { slug: 'forsikring' } },
      // ... andre kategorier
    ],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // Hent data fra Supabase
  return {
    props: {
      category: {},
      providers: [],
      offers: []
    },
    revalidate: 3600 // Regenerer hver time
  }
}
```

## 5. Sikkerhet og Compliance

### GDPR Implementering:
- Cookie consent banner
- Rett til innsyn og sletting
- Databehandleravtaler
- Personvernpolicy

### Sikkerhetstiltak:
- Rate limiting på API
- Input validering og sanitering
- CORS konfigurering
- SSL/TLS encryption
- Secure headers

## 6. Deployment og Monitoring

### Vercel Deployment:
```javascript
// vercel.json
{
  "framework": "nextjs",
  "build": {
    "env": {
      "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key"
    }
  },
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  }
}
```

### Monitoring Setup:
- Supabase Dashboard for database metrics
- Vercel Analytics for frontend performance
- Sentry for error tracking
- LogRocket for user session recording

## 7. Testing Strategy

### Unit Tests:
```typescript
// __tests__/components/ProviderCard.test.tsx
import { render, screen } from '@testing-library/react'
import ProviderCard from '../src/components/ProviderCard'

describe('ProviderCard', () => {
  it('renders provider information correctly', () => {
    const mockProvider = {
      id: 1,
      name: 'Test Provider',
      price: 299,
      rating: 4.2
    }
    
    render(<ProviderCard provider={mockProvider} />)
    
    expect(screen.getByText('Test Provider')).toBeInTheDocument()
    expect(screen.getByText('299 kr/mnd')).toBeInTheDocument()
    expect(screen.getByText('4.2')).toBeInTheDocument()
  })
})
```

### Integration Tests:
```typescript
// __tests__/api/offers.test.ts
import { createClient } from '@supabase/supabase-js'

describe('/api/offers', () => {
  it('should return offers for a specific category', async () => {
    const response = await fetch('/api/offers?category=strom')
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.offers).toBeInstanceOf(Array)
    expect(data.offers.length).toBeGreaterThan(0)
  })
})
```

## 8. Performance Optimering

### Caching Strategy:
- Static generation for kategori-sider
- ISR (Incremental Static Regeneration) for tilbud
- Redis caching for søkeresultater
- CDN for statiske assets

### Database Optimering:
```sql
-- Indekser for rask søk
CREATE INDEX idx_offers_category_price ON offers(category_id, price);
CREATE INDEX idx_offers_active_valid ON offers(is_active, valid_to);
CREATE INDEX idx_providers_category_rating ON providers(category_id, rating);
CREATE INDEX idx_reviews_provider_approved ON reviews(provider_id, is_approved);

-- Materialized view for populære tilbud
CREATE MATERIALIZED VIEW popular_offers AS
SELECT 
  o.*,
  p.name as provider_name,
  p.rating as provider_rating,
  COUNT(f.offer_id) as favorite_count
FROM offers o
JOIN providers p ON o.provider_id = p.id
LEFT JOIN user_favorites f ON o.id = f.offer_id
WHERE o.is_active = true
GROUP BY o.id, p.id
ORDER BY favorite_count DESC, o.price ASC;

-- Refresh materialized view hver time
SELECT cron.schedule('refresh-popular-offers', '0 * * * *', 'REFRESH MATERIALIZED VIEW popular_offers;');
```

## 9. Utviklingsworkflow

### Git Workflow:
```
main (produksjon)
├── develop (staging)
├── feature/category-filters
├── feature/provider-dashboard
└── hotfix/price-update-bug
```

### CI/CD Pipeline:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 10. Prosjektleveranse

### Dokumenter som leveres:
1. **Teknisk dokumentasjon** - API docs, database schema
2. **Brukermanual** - For leverandører og admin
3. **Deployment guide** - Komplett setup instruksjoner  
4. **Test plan** - Unit tests, integration tests
5. **Vedlikeholdsplan** - Backup, monitoring, oppdateringer

### Kodebase struktur:
```
sammenlign-no/
├── README.md
├── docs/
│   ├── api-documentation.md
│   ├── database-schema.md
│   ├── deployment-guide.md
│   └── user-manual.md
├── src/
├── supabase/
├── tests/
├── scripts/
└── .github/workflows/
```

Dette er en komplett implementation guide som dekker alle aspekter av prosjektet - fra database design til deployment og vedlikehold.
