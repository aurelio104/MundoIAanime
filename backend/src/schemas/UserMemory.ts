// ✅ src/schemas/UserMemory.ts — limpio y adaptado para curso y seguimiento

/** 🎭 Emociones básicas reconocidas */
export type Emotion = 'positive' | 'neutral' | 'negative';

/** 🧠 Intenciones del usuario (solo las necesarias para cursos) */
export type BotIntent =
  | 'greeting'
  | 'thank_you'
  | 'order'
  | 'price'
  | 'payment'
  | 'unknown'
  | 'question';

/** 🧠 Historial breve de interacciones */
export interface UserHistoryEntry {
  timestamp: number;
  message: string;
  emotion: Emotion;
  intent: BotIntent;
}

/** 🧠 Memoria principal del usuario para seguimiento */
export interface UserMemory {
  telefono?: string;
  name: string;
  firstSeen: number;
  lastSeen: number;
  lastMessage: string;
  history: UserHistoryEntry[];
  emotionSummary: Emotion;

  ultimaIntencion?: BotIntent;
  cursoInteresado?: string;
  cursoComprado?: string;
  comprobante?: string;
  metodoPago?: string;
  estadoPago?: 'pendiente' | 'verificado';
  correo?: string;
  apellido?: string;
  passwordGenerado?: string;

  esperandoComprobante?: boolean;
  esperandoMetodoDePago?: boolean;
  idioma?: 'es' | 'en';
}

/** 🧠 Versión completa con todos los campos obligatorios */
export type CompleteUserMemory = Required<UserMemory>;

/** MongoDB: versión con _id */
export interface UserMemoryWithId extends UserMemory {
  _id: string;
  createdAt?: Date;
  updatedAt?: Date;
}
