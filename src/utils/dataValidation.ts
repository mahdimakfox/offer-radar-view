
import { Provider } from '@/services/providerService';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateProvider = (provider: any): ValidationResult => {
  const errors: string[] = [];

  if (!provider) {
    errors.push('Provider data is missing');
    return { isValid: false, errors };
  }

  // Required fields validation
  if (!provider.name || typeof provider.name !== 'string') {
    errors.push('Provider name is required and must be a string');
  }

  if (!provider.category || typeof provider.category !== 'string') {
    errors.push('Provider category is required and must be a string');
  }

  if (provider.price === undefined || provider.price === null || typeof provider.price !== 'number' || provider.price < 0) {
    errors.push('Provider price is required and must be a non-negative number');
  }

  if (provider.rating === undefined || provider.rating === null || typeof provider.rating !== 'number' || provider.rating < 0 || provider.rating > 5) {
    errors.push('Provider rating is required and must be a number between 0 and 5');
  }

  if (!provider.description || typeof provider.description !== 'string') {
    errors.push('Provider description is required and must be a string');
  }

  if (!provider.external_url || typeof provider.external_url !== 'string') {
    errors.push('Provider external URL is required and must be a string');
  }

  // Optional fields validation
  if (provider.logo_url && typeof provider.logo_url !== 'string') {
    errors.push('Provider logo URL must be a string if provided');
  }

  if (provider.pros && !Array.isArray(provider.pros)) {
    errors.push('Provider pros must be an array if provided');
  }

  if (provider.cons && !Array.isArray(provider.cons)) {
    errors.push('Provider cons must be an array if provided');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateProviderArray = (providers: any[]): ValidationResult => {
  if (!Array.isArray(providers)) {
    return {
      isValid: false,
      errors: ['Providers data must be an array']
    };
  }

  const allErrors: string[] = [];
  let invalidCount = 0;

  providers.forEach((provider, index) => {
    const result = validateProvider(provider);
    if (!result.isValid) {
      invalidCount++;
      allErrors.push(`Provider at index ${index}: ${result.errors.join(', ')}`);
    }
  });

  return {
    isValid: invalidCount === 0,
    errors: allErrors
  };
};

export const sanitizeProvider = (provider: any): Provider | null => {
  const validation = validateProvider(provider);
  
  if (!validation.isValid) {
    console.warn('Invalid provider data:', validation.errors);
    return null;
  }

  return {
    id: provider.id,
    name: provider.name.trim(),
    category: provider.category.trim().toLowerCase(),
    price: Number(provider.price),
    rating: Number(provider.rating),
    description: provider.description.trim(),
    external_url: provider.external_url.trim(),
    logo_url: provider.logo_url?.trim() || undefined,
    pros: provider.pros || undefined,
    cons: provider.cons || undefined,
    org_number: provider.org_number?.trim() || undefined,
    industry_code: provider.industry_code?.trim() || undefined,
    ehf_invoice_support: Boolean(provider.ehf_invoice_support),
    created_at: provider.created_at || undefined,
    updated_at: provider.updated_at || undefined,
  };
};

export const logDataInconsistency = (context: string, data: any, error?: Error) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    context,
    data: JSON.stringify(data, null, 2),
    error: error?.message,
    stack: error?.stack,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.error('Data inconsistency detected:', logEntry);
  
  // In a production environment, you might want to send this to a logging service
  // Example: sendToLoggingService(logEntry);
};
