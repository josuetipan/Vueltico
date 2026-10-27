import type { PantallasCatalogRowDto } from "./pantallas-catalog.types";

/** Respuesta mock de PANTALLAS (árbol único). */
export const MOCK_PANTALLAS_CATALOG_ROOT: PantallasCatalogRowDto[] = [
  {
    id: 15160,
    itemCode: "Plataforma",
    description: "Plataforma",
    val01: "FOLDER",
    values: [
      {
        id: 15161,
        itemCode: "Empresas",
        description: "Empresas",
        val01: "SCREEN",
        val02: "empresas-listado",
        val03: "/app/superadmin/empresas",
      },
      {
        id: 15162,
        itemCode: "Planes",
        description: "Planes",
        val01: "SCREEN",
        val02: "billing-planes",
        val03: "/app/superadmin/planes",
      },
      {
        id: 15163,
        itemCode: "Suscripciones",
        description: "Suscripciones",
        val01: "SCREEN",
        val02: "billing-suscripciones",
        val03: "/app/superadmin/suscripciones",
      },
      {
        id: 15164,
        itemCode: "Facturas",
        description: "Facturas",
        val01: "SCREEN",
        val02: "billing-facturas",
        val03: "/app/superadmin/facturas",
      },
      {
        id: 15165,
        itemCode: "Administradores",
        description: "Admins. plataforma",
        val01: "SCREEN",
        val02: "platform-admins",
        val03: "/app/superadmin/administradores",
      },
    ],
  },
  {
    id: 15156,
    itemCode: "Core-Credit",
    description: "Core-Credito",
    val01: "FOLDER",
    values: [],
  },
  {
    id: 15686,
    itemCode: "Herramientas",
    description: "Herramientas",
    val01: "FOLDER",
    values: [],
  },
  {
    id: 15200,
    itemCode: "Card-Holder",
    description: "Card-Holder",
    val01: "FOLDER",
    values: [],
  },
  {
    id: 1000,
    itemCode: "mod_seguridad",
    description: "Seguridad",
    val01: "FOLDER",
    values: [
      {
        id: 1101,
        itemCode: "scr_permisos_granulares",
        description: "Permisos granulares",
        val01: "SCREEN",
        val02: "permisos-granulares",
        val03: "/seguridad/permisos-granulares",
        values: [
          {
            id: 11011,
            itemCode: "seg-prmg-btn-create-permisos",
            description: 'Botón "Crear permiso"',
            val01: "ACTION",
            val02: "POST",
            val03: "/api/v1/security/permissions",
            val04: "#btn-create-permiso",
          },
          {
            id: 11012,
            itemCode: "seg-prmg-btn-save-masivo",
            description: "Guardado masivo rol",
            val01: "ACCION",
            val02: "PUT",
            val03: "/api/v1/security/roles/{id}/grants",
            val04: "[data-testid=save-grants]",
          },
        ],
      },
      {
        id: 1102,
        itemCode: "scr_gestion_usuarios",
        description: "Gestión de usuarios",
        val01: "SCREEN",
        val02: "gestion-usuarios",
        val03: "/seguridad/usuarios",
        values: [
          {
            id: 11021,
            itemCode: "btn_editar_usuario",
            description: 'Botón "Editar"',
            val01: "ACTION",
            val04: ".btn-edit-user",
          },
        ],
      },
    ],
  },
  {
    id: 2000,
    itemCode: "mod_transferencias",
    description: "Transferencias",
    val01: "FOLDER",
    values: [
      {
        id: 2101,
        itemCode: "scr_transfers_list",
        description: "Listado de transferencias",
        val01: "SCREEN",
        val02: "transferencias-listado",
        val03: "/app/empresa/transferencias",
        values: [
          {
            id: 21011,
            itemCode: "transfers:view",
            description: "Ver listado",
            val01: "ACTION",
            val02: "GET",
            val03: "/api/v1/transfers",
          },
          {
            id: 21012,
            itemCode: "transfers:export",
            description: "Exportar Excel",
            val01: "ACTION",
            val02: "GET",
            val03: "/api/v1/transfers/export",
          },
        ],
      },
      {
        id: 2102,
        itemCode: "scr_transfer_detail",
        description: "Detalle de transferencia",
        val01: "SCREEN",
        val02: "transferencias-detalle",
        val03: "/app/empresa/transferencias/:id",
        values: [
          {
            id: 21021,
            itemCode: "transfers:approve",
            description: 'Botón "Aprobar"',
            val01: "ACTION",
            val02: "PATCH",
            val03: "/api/v1/transfers/{id}/approve",
          },
          {
            id: 21022,
            itemCode: "transfers:delete",
            description: 'Botón "Eliminar"',
            val01: "ACTION",
            val02: "DELETE",
            val03: "/api/v1/transfers/{id}",
          },
        ],
      },
    ],
  },
  {
    id: 3000,
    itemCode: "mod_parametrizacion",
    description: "Parametrización",
    val01: "FOLDER",
    values: [
      {
        id: 3100,
        itemCode: "fld_catalogos",
        description: "Catálogos",
        val01: "FOLDER",
        values: [
          {
            id: 3101,
            itemCode: "scr_pantallas_catalog",
            description: "Catálogo PANTALLAS",
            val01: "SCREEN",
            val02: "catalogo-pantallas",
            val03: "/parametrizacion/catalogos/pantallas",
            values: [
              {
                id: 31011,
                itemCode: "cat-select-scope-catalog",
                description: "Selector ámbito catálogo",
                val01: "ACTION",
                val04: "app-catalog-scope-select",
              },
            ],
          },
        ],
      },
    ],
  },
];

/** Pantallas habilitadas para la entidad demo (paso previo). */
export const MOCK_ENTITY_ALLOWED_SCREEN_IDS = new Set<number>([
  1101, 1102, 2101, 2102, 3101,
]);
