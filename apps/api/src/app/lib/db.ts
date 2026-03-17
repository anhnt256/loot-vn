import {
  PrismaClient,
  FnetPrismaClient,
  FnetPrisma,
} from '@gateway-workspace/database';

export const db = new PrismaClient();

// Cache to hold dynamic instantiations of Fnet clients mapped by fnetUrl
const fnetClientCache: Record<string, FnetPrismaClient> = {};

/**
 * Get Fnet Database Client dynamically. 
 * Creates a new PrismaClient connection if one hasn't been cached for the URL.
 * @param fnetUrl The Fnet Connection URL (retrieved from the Tenant model)
 */
export async function getFnetDB(fnetUrl: string): Promise<FnetPrismaClient> {
  if (!fnetUrl) throw new Error('Fnet URL is required but not provided');
  
  if (!fnetClientCache[fnetUrl]) {
    fnetClientCache[fnetUrl] = new FnetPrismaClient({
      datasources: { db: { url: fnetUrl } },
    });
  }
  
  return fnetClientCache[fnetUrl];
}

export async function getFnetPrisma(fnetUrl: string) {
  if (!fnetUrl) throw new Error('Fnet URL is required but not provided');
  return FnetPrisma;
}

export async function disconnectAll() {
  try {
    await db.$disconnect();
    
    // Disconnect all dynamically cached Fnet clients
    const disconnectPromises = Object.values(fnetClientCache).map(client => client.$disconnect());
    await Promise.all(disconnectPromises);
    
  } catch (error) {
    console.error('Error disconnecting databases:', error);
  }
}
