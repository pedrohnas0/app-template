import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * MSW Server - Mock Service Worker server para testes
 *
 * Este servidor intercepta requisições HTTP em testes de integração
 * e retorna responses mockadas baseadas nos handlers definidos
 */
export const server = setupServer(...handlers);
