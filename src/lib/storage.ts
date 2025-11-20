import { isServer } from "./utils";
import * as server from "./storage.server";
import * as client from "./storage.client";

const mod = isServer ? server : client;

// IDOSOS
export const saveIdoso = mod.saveIdoso;
export const loadIdoso = mod.loadIdoso;
export const loadIdososByTutor = mod.loadIdososByTutor;

// EVENTOS
export const saveEvento = mod.saveEvento;
export const loadEventosByTutor = mod.loadEventosByTutor;
export const markEventoAsRead = mod.markEventoAsRead;

// ID
export const generateId = mod.generateId;

// USUÁRIOS / LOGIN → apenas server
export const saveUserCredentials = server.saveUserCredentials;
export const checkCredentials = server.checkCredentials;
