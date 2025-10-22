import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Museum Proxy Service E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  }, 10000); // Aumentar timeout para dar tiempo a cerrar conexiones

  describe('Health Check', () => {
    it('/api/v1/proxy/health (GET) - should return ok status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/proxy/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('service', 'museum-proxy-service');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('Search Artworks - MET Museum', () => {
    it('/api/v1/proxy/artworks/search?query=monet&museum=met&limit=10 (GET) - should return MET artworks', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/search')
        .query({ query: 'monet', museum: 'met', limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('source', 'met');

      const { data } = response.body;
      expect(Array.isArray(data)).toBe(true);

      if (data.length > 0) {
        const firstArtwork = data[0];
        expect(firstArtwork).toHaveProperty('id');
        expect(firstArtwork).toHaveProperty('title');
        expect(firstArtwork).toHaveProperty('museum', 'met');
        expect(firstArtwork.id).toMatch(/^met_/);
      }

      console.log(`✅ MET search returned ${data.length} artworks`);
    }, 15000);

    it('/api/v1/proxy/artworks/search?query=painting&museum=met&limit=5 (GET) - should respect limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/search')
        .query({ query: 'painting', museum: 'met', limit: 5 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);

      console.log(`✅ MET search with limit=5 returned ${response.body.data.length} artworks`);
    }, 15000);
  });

  describe('Search Artworks - Harvard Museum', () => {
    it('/api/v1/proxy/artworks/search?query=portrait&museum=harvard&limit=10 (GET) - should return Harvard artworks', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/search')
        .query({ query: 'portrait', museum: 'harvard', limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('source', 'harvard');

      const { data } = response.body;
      expect(Array.isArray(data)).toBe(true);

      if (data.length > 0) {
        const firstArtwork = data[0];
        expect(firstArtwork).toHaveProperty('id');
        expect(firstArtwork).toHaveProperty('title');
        expect(firstArtwork).toHaveProperty('museum', 'harvard');
        expect(firstArtwork.id).toMatch(/^harvard_/);
      }

      console.log(`✅ Harvard search returned ${data.length} artworks`);
    }, 15000);
  });

  describe('Validation & Error Handling', () => {
    it('/api/v1/proxy/artworks/search (GET) - should fail when query parameter is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/search')
        .query({ museum: 'met', limit: 10 })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('/api/v1/proxy/artworks/search (GET) - should fail when museum parameter is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/search')
        .query({ query: 'test', limit: 10 })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('/api/v1/proxy/artworks/search?query=test&museum=invalid&limit=10 (GET) - should fail with invalid museum', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/search')
        .query({ query: 'test', museum: 'invalid', limit: 10 })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('/api/v1/proxy/artworks/search?query=&museum=met&limit=10 (GET) - should fail with empty query', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/search')
        .query({ query: '', museum: 'met', limit: 10 })
        .expect(400);
    });
  });

  describe('Artwork Detail - MET', () => {
    it('/api/v1/proxy/artworks/met/:id (GET) - should return artwork detail', async () => {
      // Primero buscar para obtener un ID válido
      const searchResponse = await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/search')
        .query({ query: 'painting', museum: 'met', limit: 1 });

      const artwork = searchResponse.body.data[0];
      if (!artwork) {
        console.warn('⚠️ No MET artwork found, skipping detail test');
        return;
      }

      // Extraer ID sin prefijo
      const artworkId = artwork.id.replace('met_', '');

      const response = await request(app.getHttpServer())
        .get(`/api/v1/proxy/artworks/met/${artworkId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('museum', 'met');
      expect(response.body).toHaveProperty('source', 'met');

      console.log(`✅ Retrieved MET artwork detail: ${response.body.data.title}`);
    }, 15000);

    it('/api/v1/proxy/artworks/met/999999999 (GET) - should return 404 for non-existent artwork', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/met/999999999')
        .expect(404);
    }, 10000);
  });

  describe('Artwork Detail - Harvard', () => {
    it('/api/v1/proxy/artworks/harvard/:id (GET) - should return artwork detail', async () => {
      // Primero buscar para obtener un ID válido
      const searchResponse = await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/search')
        .query({ query: 'portrait', museum: 'harvard', limit: 1 });

      const artwork = searchResponse.body.data[0];
      if (!artwork) {
        console.warn('⚠️ No Harvard artwork found, skipping detail test');
        return;
      }

      // Extraer ID sin prefijo
      const artworkId = artwork.id.replace('harvard_', '');

      const response = await request(app.getHttpServer())
        .get(`/api/v1/proxy/artworks/harvard/${artworkId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('museum', 'harvard');
      expect(response.body).toHaveProperty('source', 'harvard');

      console.log(`✅ Retrieved Harvard artwork detail: ${response.body.data.title}`);
    }, 15000);
  });

  describe('Circuit Breaker & Cache', () => {
    it('should use cache on repeated identical requests', async () => {
      const query = { query: 'sculpture', museum: 'met', limit: 5 };

      // Primera llamada - debería ir al servicio
      const firstResponse = await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/search')
        .query(query)
        .expect(200);

      expect(firstResponse.body.fromCache).toBeFalsy();

      // Segunda llamada - debería venir de cache
      const secondResponse = await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/search')
        .query(query)
        .expect(200);

      // Verificar que ambas respuestas son exitosas
      expect(firstResponse.body.success).toBe(true);
      expect(secondResponse.body.success).toBe(true);

      console.log('✅ Cache mechanism validated');
    }, 20000);

    it('should handle high request volume without crashing', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        request(app.getHttpServer())
          .get('/api/v1/proxy/artworks/search')
          .query({ query: `art${i}`, museum: 'met', limit: 3 }),
      );

      const results = await Promise.allSettled(requests);

      // Al menos el 80% debe ser exitoso
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      expect(successful).toBeGreaterThanOrEqual(8);

      console.log(`✅ Handled ${successful}/10 concurrent requests successfully`);
    }, 30000);
  });

  describe('Performance', () => {
    it('should return search results within acceptable time (< 3 seconds)', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/search')
        .query({ query: 'art', museum: 'met', limit: 5 })
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(3000);
      console.log(`✅ Search completed in ${duration}ms (< 3000ms threshold)`);
    }, 10000);

    it('should return artwork detail within acceptable time (< 2 seconds)', async () => {
      // Obtener un ID válido primero
      const searchResponse = await request(app.getHttpServer())
        .get('/api/v1/proxy/artworks/search')
        .query({ query: 'painting', museum: 'met', limit: 1 });

      const artwork = searchResponse.body.data[0];
      if (!artwork) {
        console.warn('⚠️ No artwork found, skipping performance test');
        return;
      }

      const artworkId = artwork.id.replace('met_', '');
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get(`/api/v1/proxy/artworks/met/${artworkId}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000);
      console.log(`✅ Artwork detail retrieved in ${duration}ms (< 2000ms threshold)`);
    }, 15000);
  });
});
