import { HarvardArtwork } from '../entities/harvard-artwork.entity';
import { HarvardObjectId } from '../value-objects/harvard-object-id.vo';
import { SearchQuery } from '../value-objects/search-query.vo';

/**
 * Harvard Art Museums API Repository Interface
 * Define los contratos para acceder a la API de Harvard Art Museums
 */
export interface HarvardApiRepository {
  /**
   * Buscar obras en Harvard Art Museums
   * @param query - Término de búsqueda
   * @param limit - Límite de resultados (opcional)
   * @returns Array de IDs de objetos encontrados
   */
  search(query: SearchQuery, limit?: number): Promise<string[]>;

  /**
   * Obtener obra específica por ID
   * @param objectId - ID único del objeto en Harvard
   * @returns Obra de arte o null si no se encuentra
   */
  getArtworkById(objectId: HarvardObjectId): Promise<HarvardArtwork | null>;

  /**
   * Obtener múltiples obras por IDs
   * @param objectIds - Array de IDs de objetos
   * @returns Array de obras encontradas
   */
  getMultipleArtworks(objectIds: HarvardObjectId[]): Promise<HarvardArtwork[]>;

  /**
   * Obtener divisiones/departamentos disponibles
   * @returns Array de divisiones de Harvard Art Museums
   */
  getDivisions(): Promise<{ divisionId: string; name: string }[]>;

  /**
   * Obtener clasificaciones disponibles  
   * @returns Array de clasificaciones de obras
   */
  getClassifications(): Promise<{ classificationId: string; name: string }[]>;

  /**
   * Obtener culturas disponibles
   * @returns Array de culturas
   */
  getCultures(): Promise<{ cultureId: string; name: string }[]>;

  /**
   * Verificar estado de la API
   * @returns true si la API está disponible
   */
  isHealthy(): Promise<boolean>;
}