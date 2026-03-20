import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";

type LoginResp = {
  access_token?: string;
  token?: string;
};

function getToken(body: LoginResp) {
  // Ajustá esto si tu login devuelve otro campo
  return body.access_token ?? body.token;
}

describe("E2E - all endpoints", () => {
  let app: INestApplication;

  let adminToken: string;
  let operarioToken: string;

  let categoryId: string;
  let variantId: string;

  let orderId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // =========================
  // SISTEMA
  // =========================

  it("POST /api/sistema/login (ADMIN)", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/sistema/login")
      .send({ pin: "1234" })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`Unexpected status: ${r.status} body=${JSON.stringify(r.body)}`);
        }
      });

    const token = getToken(res.body);
    expect(typeof token).toBe("string");
    adminToken = token as string;
  });

  it("POST /api/sistema/login (OPERARIO)", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/sistema/login")
      .send({ pin: "0000" })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`Unexpected status: ${r.status} body=${JSON.stringify(r.body)}`);
        }
      });

    const token = getToken(res.body);
    expect(typeof token).toBe("string");
    operarioToken = token as string;
  });

  // =========================
  // CATALOGO (sin guard en tu código actual)
  // =========================

  it("GET /api/catalogo/categorias", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/catalogo/categorias")
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /api/catalogo/categorias", async () => {
    const slug = `test-cat-${Date.now()}`;

    const res = await request(app.getHttpServer())
      .post("/api/catalogo/categorias")
      .send({ slug, name: "Test Cat", sortOrder: 999 })
      .expect((r) => {
        // si ya existe por seed/otra corrida, puede devolver 409 si lo implementaste
        if (![200, 201].includes(r.status)) {
          throw new Error(`Unexpected status: ${r.status} body=${JSON.stringify(r.body)}`);
        }
      });

    expect(res.body).toHaveProperty("id");
    categoryId = res.body.id;
  });

  it("POST /api/catalogo/familias", async () => {
    // Creamos una familia con 1 flavor y 1 variante para conseguir variantId
    const famSlug = `test-fam-${Date.now()}`;

    const res = await request(app.getHttpServer())
      .post("/api/catalogo/familias")
      .send({
        categoryId,
        slug: famSlug,
        name: "Test Burger",
        imageUrl: "/images/burgers/clasica/simple.jpg",
        sortOrder: 1,
        flavors: [
          {
            slug: "default",
            nameSuffix: "",
            description: "Test desc",
            sortOrder: 0,
            variants: [
              {
                slug: "simple",
                label: "Simple",
                priceCents: 10000,
                sortOrder: 1,
              },
            ],
          },
        ],
      })
      .expect((r) => {
        if (![200, 201].includes(r.status)) {
          throw new Error(`Unexpected status: ${r.status} body=${JSON.stringify(r.body)}`);
        }
      });

    // service.crearFamilia devuelve include flavors.variants (según lo que armamos)
    const v = res.body?.flavors?.[0]?.variants?.[0];
    expect(v).toHaveProperty("id");
    variantId = v.id;
  });

  it("GET /api/catalogo/familias", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/catalogo/familias")
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  // =========================
  // COMANDAS (con guard)
  // =========================

  it("POST /api/comandas (401 sin token)", async () => {
    await request(app.getHttpServer())
      .post("/api/comandas")
      .send({ notes: "x", items: [{ productId: variantId, quantity: 1 }] })
      .expect(401);
  });

  it("POST /api/comandas (OPERARIO)", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/comandas")
      .set("Authorization", `Bearer ${operarioToken}`)
      .send({
        notes: "Pedido test",
        items: [{ productId: variantId, quantity: 2 }],
      })
      .expect(201); // si tu controller devuelve 200, cambiá a .expect((r)=>...) como arriba

    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("orderNumber");
    expect(res.body).toHaveProperty("items");
    orderId = res.body.id;
  });

  it("GET /api/comandas/:id", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/comandas/${orderId}`)
      .set("Authorization", `Bearer ${operarioToken}`)
      .expect(200);

    expect(res.body).toHaveProperty("id", orderId);
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it("GET /api/comandas/:id/ticket", async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/comandas/${orderId}/ticket`)
      .set("Authorization", `Bearer ${operarioToken}`)
      .expect(200);

    expect(res.body).toHaveProperty("orderId", orderId);
    expect(typeof res.body.text).toBe("string");
    expect(res.body.text).toContain("COMANDA");
  });

  it("POST /api/comandas/:id/print (body inválido => 400)", async () => {
    await request(app.getHttpServer())
      .post(`/api/comandas/${orderId}/print`)
      .set("Authorization", `Bearer ${operarioToken}`)
      .send({ printerName: "X" }) // falta success boolean
      .expect(400);
  });

  it("POST /api/comandas/:id/print (OK)", async () => {
    await request(app.getHttpServer())
      .post(`/api/comandas/${orderId}/print`)
      .set("Authorization", `Bearer ${operarioToken}`)
      .send({ success: true, printerName: "TestPrinter" })
      .expect(200);
  });

  it("POST /api/comandas/:id/anular (OPERARIO => 403)", async () => {
    await request(app.getHttpServer())
      .post(`/api/comandas/${orderId}/anular`)
      .set("Authorization", `Bearer ${operarioToken}`)
      .send({ reason: "No" }) // además es <3, pero debería pegar 403 antes
      .expect(403);
  });

  it("POST /api/comandas/:id/anular (ADMIN con reason inválida => 400)", async () => {
    await request(app.getHttpServer())
      .post(`/api/comandas/${orderId}/anular`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "ok" }) // 2 chars
      .expect(400);
  });

  it("POST /api/comandas/:id/anular (ADMIN => 200)", async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/comandas/${orderId}/anular`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ reason: "Cliente canceló" })
      .expect(200);

    expect(res.body).toHaveProperty("void");
    expect(res.body.void).toHaveProperty("isVoided", true);
  });

  it("POST /api/comandas/:id/print (anulada => 400)", async () => {
    await request(app.getHttpServer())
      .post(`/api/comandas/${orderId}/print`)
      .set("Authorization", `Bearer ${operarioToken}`)
      .send({ success: true, printerName: "X" })
      .expect(400);
  });
});