import type { VapiConfig } from '../types/vapi';

// Configuración simplificada que usa tu asistente pre-configurado en Vapi
export const vapiConfig: VapiConfig = {
  // Solo credenciales - El asistente está configurado en tu dashboard de Vapi
  publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '82b4ff2e-cf2a-40fc-bcea-331a66719c07',
  assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '8a540a3e-e5f2-43c9-a398-723516f8bf80'
};

// Configuración para desarrollo (usa el mismo asistente)
export const vapiConfigDev: VapiConfig = {
  publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '82b4ff2e-cf2a-40fc-bcea-331a66719c07',
  assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '8a540a3e-e5f2-43c9-a398-723516f8bf80'
};
