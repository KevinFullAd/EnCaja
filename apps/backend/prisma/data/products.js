// data/products.js
 
export const CATALOG = [
    // ===== CLASICA (simple/doble/triple) =====
    {
        id: "clasica",
        categoryId: "clasica",
        name: "Clásica",
        active: true,
        flavors: [
            {
                id: "default",
                nameSuffix: "",
                description: "Medallón de carne, cheddar, lechuga y tomate",
                active: true,
                variants: [
                    {
                        id: "simple",
                        label: "Simple",
                        priceCents: 1100000,
                        imageUrl: "/images/burgers/clasica/simple.jpg",
                        active: true,
                    },
                    {
                        id: "doble",
                        label: "Doble",
                        priceCents: 1400000,
                        imageUrl: "/images/burgers/clasica/doble.jpg",
                        active: true,
                    },
                    {
                        id: "triple",
                        label: "Triple",
                        priceCents: 1700000,
                        imageUrl: "/images/burgers/clasica/triple.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },

    // ===== CRISPY (simple/doble/triple) =====
    {
        id: "crispy",
        categoryId: "crispy",
        name: "Cebolla Crispy",
        active: true,
        flavors: [
            {
                id: "default",
                nameSuffix: "",
                description: "Medallón de carne, cheddar, bacon, cebolla crispy",
                active: true,
                variants: [
                    {
                        id: "simple",
                        label: "Simple",
                        priceCents: 1200000,
                        imageUrl: "/images/burgers/crispy/simple.jpg",
                        active: true,
                    },
                    {
                        id: "doble",
                        label: "Doble",
                        priceCents: 1500000,
                        imageUrl: "/images/burgers/crispy/doble.jpg",
                        active: true,
                    },
                    {
                        id: "triple",
                        label: "Triple",
                        priceCents: 1700000,
                        imageUrl: "/images/burgers/crispy/triple.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },

    // ===== CHEESE (simple/doble/triple) =====
    {
        id: "cheese",
        categoryId: "cheese",
        name: "Cheese",
        active: true,
        flavors: [
            {
                id: "default",
                nameSuffix: "",
                description: "Medallón de carne, cheddar",
                active: true,
                variants: [
                    {
                        id: "simple",
                        label: "Simple",
                        priceCents: 1100000,
                        imageUrl: "/images/burgers/cheese/simple.jpg",
                        active: true,
                    },
                    {
                        id: "doble",
                        label: "Doble",
                        priceCents: 1400000,
                        imageUrl: "/images/burgers/cheese/doble.jpg",
                        active: true,
                    },
                    {
                        id: "triple",
                        label: "Triple",
                        priceCents: 1700000,
                        imageUrl: "/images/burgers/cheese/triple.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },

    // ===== CHEESE_BACON (simple/doble/triple) =====
    {
        id: "cheese_bacon",
        categoryId: "cheese_bacon",
        name: "Cheese Bacon",
        active: true,
        flavors: [
            {
                id: "default",
                nameSuffix: "",
                description: "Medallón de carne, cheddar, bacon",
                active: true,
                variants: [
                    {
                        id: "simple",
                        label: "Simple",
                        priceCents: 1200000,
                        imageUrl: "/images/burgers/cheese_bacon/simple.jpg",
                        active: true,
                    },
                    {
                        id: "doble",
                        label: "Doble",
                        priceCents: 1500000,
                        imageUrl: "/images/burgers/cheese_bacon/doble.jpg",
                        active: true,
                    },
                    {
                        id: "triple",
                        label: "Triple",
                        priceCents: 1800000,
                        imageUrl: "/images/burgers/cheese_bacon/triple.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },

    // ===== BARBACOA (simple/doble/triple) =====
    {
        id: "barbacoa",
        categoryId: "barbacoa",
        name: "Barbacoa",
        active: true,
        flavors: [
            {
                id: "default",
                nameSuffix: "",
                description: "Medallón de carne, cheddar, salsa barbacoa",
                active: true,
                variants: [
                    {
                        id: "simple",
                        label: "Simple",
                        priceCents: 1200000,
                        imageUrl: "/images/burgers/barbacoa/simple.jpg",
                        active: true,
                    },
                    {
                        id: "doble",
                        label: "Doble",
                        priceCents: 1500000,
                        imageUrl: "/images/burgers/barbacoa/doble.jpg",
                        active: true,
                    },
                    {
                        id: "triple",
                        label: "Triple",
                        priceCents: 1800000,
                        imageUrl: "/images/burgers/barbacoa/triple.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },

    // ===== AROS (simple/doble/triple) =====
    {
        id: "aros",
        categoryId: "aros",
        name: "Aros Burger",
        active: true,
        flavors: [
            {
                id: "default",
                nameSuffix: "",
                description: "Medallón de carne, cheddar, aros de cebolla",
                active: true,
                variants: [
                    {
                        id: "simple",
                        label: "Simple",
                        priceCents: 1200000,
                        imageUrl: "/images/burgers/aros/simple.jpg",
                        active: true,
                    },
                    {
                        id: "doble",
                        label: "Doble",
                        priceCents: 1500000,
                        imageUrl: "/images/burgers/aros/doble.jpg",
                        active: true,
                    },
                    {
                        id: "triple",
                        label: "Triple",
                        priceCents: 1800000,
                        imageUrl: "/images/burgers/aros/triple.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },

    // ===== MENSUAL: MEXICANA (2 sabores distintos, misma foto; variantes simple/doble) =====
    {
        id: "mensual-mexicana",
        categoryId: "mensual",
        name: "Mexicana",
        active: true,
        // misma foto para todas las opciones
        imageUrl: "/images/burgers/mensual/mexicana_simple.jpg",
        flavors: [
            {
                id: "nachos",
                nameSuffix: "con nachos",
                description: "Burger del mes (mexicana) con nachos",
                active: true,
                variants: [
                    { id: "simple", label: "Simple", priceCents: 1300000, active: true },
                    { id: "doble", label: "Doble", priceCents: 1600000, active: true },
                ],
            },
            {
                id: "verdeo",
                nameSuffix: "con cebolla y verdeo",
                description: "Burger del mes (mexicana) con cebolla y verdeo",
                active: true,
                variants: [
                    { id: "simple", label: "Simple", priceCents: 1300000, active: true },
                    { id: "doble", label: "Doble", priceCents: 1600000, active: true },
                ],
            },
        ],
    },

    // ===== POLLO-CRISPY (2 recetas, 1 variante cada una) =====
    {
        id: "pollo-crispy",
        categoryId: "pollo-crispy",
        name: "Pollo Crispy",
        active: true,
        flavors: [
            {
                id: "clasica",
                nameSuffix: "clásica",
                description: "Pollo crispy, cheddar, lechuga y tomate",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 1300000,
                        imageUrl: "/images/burgers/pollo-crispy/clasica.jpg",
                        active: true,
                    },
                ],
            },
            {
                id: "cheese-bacon",
                nameSuffix: "cheese & bacon",
                description: "Pollo crispy, cheddar y bacon",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 1450000,
                        imageUrl: "/images/burgers/pollo-crispy/cheese-bacon.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },

    // ===== PREMIUM (4 productos distintos, 1 variante cada uno) =====
    {
        id: "premium-bondiola",
        categoryId: "premium",
        name: "Premium",
        active: true,
        flavors: [
            {
                id: "bondiola",
                nameSuffix: "bondiola",
                description: "Burger premium con bondiola",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 1800000,
                        imageUrl: "/images/burgers/premium/bondiola.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },
    {
        id: "premium-picante",
        categoryId: "premium",
        name: "Premium",
        active: true,
        flavors: [
            {
                id: "picante",
                nameSuffix: "picante",
                description: "Burger premium con toque picante",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 1800000,
                        imageUrl: "/images/burgers/premium/picante.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },
    {
        id: "premium-teque-burger",
        categoryId: "premium",
        name: "Premium",
        active: true,
        flavors: [
            {
                id: "teque-burger",
                nameSuffix: "teque burger",
                description: "Burger premium con tequeños",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 1900000,
                        imageUrl: "/images/burgers/premium/teque_burger.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },
    {
        id: "premium-triple-teque-burger",
        categoryId: "premium",
        name: "Premium",
        active: true,
        flavors: [
            {
                id: "triple-teque-burger",
                nameSuffix: "triple teque burger",
                description: "Versión triple de la teque burger",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 2200000,
                        imageUrl: "/images/burgers/premium/triple_teque_burger.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },

    // ===== VEGGIE (1 producto) =====
    {
        id: "veggie",
        categoryId: "veggie",
        name: "Veggie",
        active: true,
        flavors: [
            {
                id: "default",
                nameSuffix: "",
                description: "Burger vegetariana",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 1200000,
                        imageUrl: "/images/burgers/veggie/veggie.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },

    // ===== EXTRAS =====
    {
        id: "extras",
        categoryId: "extras",
        name: "Extras",
        active: true,
        flavors: [
            {
                id: "papas",
                nameSuffix: "papas fritas",
                description: "Porción de papas fritas",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 500000,
                        imageUrl: "/images/extras/papas.jpg",
                        active: true,
                    },
                ],
            },
            {
                id: "aros",
                nameSuffix: "aros de cebolla",
                description: "Porción de aros de cebolla",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 550000,
                        imageUrl: "/images/extras/aros.jpg",
                        active: true,
                    },
                ],
            },
            {
                id: "bastones",
                nameSuffix: "bastones",
                description: "Porción de bastones",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 500000,
                        imageUrl: "/images/extras/bastones.jpg",
                        active: true,
                    },
                ],
            },
            {
                id: "nuggets",
                nameSuffix: "nuggets",
                description: "Porción de nuggets",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 600000,
                        imageUrl: "/images/extras/nuggets.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },

    // ===== TEQUEÑOS =====
    {
        id: "tequenos",
        categoryId: "tequenos",
        name: "Tequeños",
        active: true,
        flavors: [
            {
                id: "mini",
                nameSuffix: "mini",
                description: "Porción mini",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 400000,
                        imageUrl: "/images/tequenos/mini.jpg",
                        active: true,
                    },
                ],
            },
            {
                id: "media",
                nameSuffix: "media docena",
                description: "6 tequeños",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 700000,
                        imageUrl: "/images/tequenos/media.jpg",
                        active: true,
                    },
                ],
            },
            {
                id: "docena",
                nameSuffix: "docena",
                description: "12 tequeños",
                active: true,
                variants: [
                    {
                        id: "unit",
                        label: "",
                        priceCents: 1300000,
                        imageUrl: "/images/tequenos/docena.jpg",
                        active: true,
                    },
                ],
            },
        ],
    },
];
