import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Composition Service E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  }, 10000); // Aumentar timeout para dar tiempo a cerrar conexiones

  describe('Health Check', () => {
    it('/api/v1/composition/health (GET) - should return healthy status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/composition/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'healthy');
          expect(res.body).toHaveProperty('service', 'composition-service');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('Search Artworks - Happy Paths', () => {
    it('/api/v1/composition/search?query=painting&limit=6 (GET) - should return mixed results from multiple museums', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/composition/search')
        .query({ query: 'painting', limit: 6 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('artworks');
      expect(response.body.data).toHaveProperty('metadata');

      const { artworks, metadata } = response.body.data;

      // Validar estructura de artworks
      expect(Array.isArray(artworks)).toBe(true);
      expect(artworks.length).toBeGreaterThan(0);

      // Validar primer artwork
      const firstArtwork = artworks[0];
      expect(firstArtwork).toHaveProperty('id');
      expect(firstArtwork).toHaveProperty('title');
      expect(firstArtwork).toHaveProperty('museum');
      expect(['met', 'harvard']).toContain(firstArtwork.museum);

      // Validar metadata
      expect(metadata).toHaveProperty('totalCount');
      expect(metadata).toHaveProperty('sources');
      expect(metadata).toHaveProperty('query', 'painting');
      expect(metadata).toHaveProperty('searchTime');

      // Validar sources
      expect(Array.isArray(metadata.sources)).toBe(true);
      expect(metadata.sources.length).toBeGreaterThan(0);

      const firstSource = metadata.sources[0];
      expect(firstSource).toHaveProperty('source');
      expect(firstSource).toHaveProperty('count');
      expect(firstSource).toHaveProperty('responseTime');
      expect(firstSource).toHaveProperty('success');

      console.log(`✅ Search returned ${artworks.length} artworks in ${metadata.searchTime}ms`);
    }, 20000);

    it('/api/v1/composition/search?query=monet&museums=met&limit=10 (GET) - should return only MET results', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/composition/search')
        .query({ query: 'monet', museums: 'met', limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      const { artworks, metadata } = response.body.data;

      // Verificar que solo hay artworks de MET
      artworks.forEach((artwork: any) => {
        expect(artwork.museum).toBe('met');
        expect(artwork.id).toMatch(/^met_/);
      });

      // Verificar que metadata solo incluye MET
      const metSource = metadata.sources.find((s: any) => s.source === 'met');
      expect(metSource).toBeDefined();
      expect(metSource.success).toBe(true);

      console.log(`✅ MET-only search returned ${artworks.length} artworks`);
    }, 15000);

    it('/api/v1/composition/search?query=portrait&museums=harvard&limit=5 (GET) - should return only Harvard results', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/composition/search')
        .query({ query: 'portrait', museums: 'harvard', limit: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      const { artworks, metadata } = response.body.data;

      // Verificar que solo hay artworks de Harvard
      artworks.forEach((artwork: any) => {
        expect(artwork.museum).toBe('harvard');
        expect(artwork.id).toMatch(/^harvard_/);
      });

      // Verificar metadata
      const harvardSource = metadata.sources.find((s: any) => s.source === 'harvard');
      expect(harvardSource).toBeDefined();
      expect(harvardSource.success).toBe(true);

      console.log(`✅ Harvard-only search returned ${artworks.length} artworks`);
    }, 15000);
  });

  describe('Search Artworks - Validation & Error Handling', () => {
    it('/api/v1/composition/search (GET) - should fail when query parameter is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/composition/search')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('query'),
        ]),
      );
    });

    it('/api/v1/composition/search?query=test&limit=-5 (GET) - should handle invalid limit gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/composition/search')
        .query({ query: 'test', limit: -5 })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('/api/v1/composition/search?query=xyzabc123nonexistent&limit=5 (GET) - should return empty or few results', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/composition/search')
        .query({ query: 'xyzabc123nonexistent', limit: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      const { artworks, metadata } = response.body.data;

      expect(artworks.length).toBeLessThanOrEqual(5);
      expect(metadata.totalCount).toBeGreaterThanOrEqual(0);

      console.log(`✅ Non-existent query returned ${artworks.length} artworks`);
    }, 15000);
  });

  describe('Artwork Detail', () => {
    it('/api/v1/composition/artworks/:id?museum=met (GET) - should return artwork detail from MET', async () => {
      const searchResponse = await request(app.getHttpServer())
        .get('/api/v1/composition/search')
        .query({ query: 'painting', museums: 'met', limit: 1 });

      const artwork = searchResponse.body.data.artworks[0];
      if (!artwork) {
        console.warn('⚠️ No MET artwork found, skipping detail test');
        return;
      }

      const artworkId = artwork.id.replace('met_', '');

      const response = await request(app.getHttpServer())
        .get(`/api/v1/composition/artworks/${artworkId}`)
        .query({ museum: 'met' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('museum', 'met');

      console.log(`✅ Retrieved detail for artwork: ${response.body.data.title}`);
    }, 15000);

    it('/api/v1/composition/artworks/999999999?museum=met (GET) - should return 404 for non-existent artwork', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/composition/artworks/999999999')
        .query({ museum: 'met' })
        .expect(404);
    }, 10000);
  });

  describe('Performance & Reliability', () => {
    it('should handle multiple concurrent search requests', async () => {
      const queries = ['painting', 'sculpture', 'portrait', 'landscape'];
      const startTime = Date.now();

      const promises = queries.map((query) =>
        request(app.getHttpServer())
          .get('/api/v1/composition/search')
          .query({ query, limit: 5 })
          .expect(200),
      );

      const results = await Promise.all(promises);
      const endTime = Date.now();

      results.forEach((response) => {
        expect(response.body.success).toBe(true);
        expect(response.body.data.artworks).toBeDefined();
      });

      console.log(`✅ Handled ${queries.length} concurrent requests in ${endTime - startTime}ms`);
    }, 30000);

    it('should return results within acceptable time (< 5 seconds)', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/api/v1/composition/search')
        .query({ query: 'art', limit: 10 })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000);
      console.log(`✅ Search completed in ${duration}ms (< 5000ms threshold)`);
    }, 10000);
  });

  describe('Service Integration', () => {
    it('should handle partial service failures gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/composition/search')
        .query({ query: 'test', museums: 'met,harvard', limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      const { metadata } = response.body.data;

      // Al menos un museo debería responder exitosamente
      const successfulSources = metadata.sources.filter((s: any) => s.success);
      expect(successfulSources.length).toBeGreaterThan(0);

      console.log(`✅ ${successfulSources.length}/${metadata.sources.length} sources responded successfully`);
    }, 15000);
  });
});
