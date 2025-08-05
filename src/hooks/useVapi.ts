import { useState, useEffect, useCallback, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import type { VapiConfig, VapiCallStatus, VapiHookReturn } from '../types/vapi';

export const useVapi = (config: VapiConfig): VapiHookReturn => {
  const [callStatus, setCallStatus] = useState<VapiCallStatus>({
    status: 'inactive',
    messages: [],
    activeTranscript: ''
  });

  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    // Inicializar Vapi con el SDK real
    vapiRef.current = new Vapi(config.publicKey);

    const vapi = vapiRef.current;

    // Event listeners para el SDK real de Vapi
    vapi.on('call-start', () => {
      console.log('✅ Vapi: Llamada iniciada');
      setCallStatus(prev => ({ ...prev, status: 'active' }));
    });

    vapi.on('call-end', () => {
      console.log('🔴 Vapi: Llamada terminada');
      setCallStatus(prev => ({ 
        ...prev, 
        status: 'inactive',
        activeTranscript: '' 
      }));
    });

    vapi.on('speech-start', () => {
      console.log('🎤 Vapi: Usuario comenzó a hablar');
    });

    vapi.on('speech-end', () => {
      console.log('🔇 Vapi: Usuario terminó de hablar');
    });

    vapi.on('message', (message: any) => {
      console.log('💬 Vapi: Mensaje recibido:', message);
      
      // Solo procesar mensajes del asistente, no los transcripts
      if (message.type === 'assistant-message' || (message.role === 'assistant' && message.content)) {
        setCallStatus(prev => ({
          ...prev,
          messages: [...(prev.messages || []), {
            role: message.role,
            content: message.content,
            timestamp: new Date()
          }]
        }));
      }

      // Manejar transcripciones en tiempo real
      if (message.type === 'transcript' && message.transcriptType === 'partial') {
        setCallStatus(prev => ({
          ...prev,
          activeTranscript: message.transcript
        }));
      }
    });

    vapi.on('error', (error: any) => {
      console.error('❌ Vapi: Error:', error);
      
      // Manejar diferentes tipos de errores
      if (error.errorMsg === 'Meeting has ended') {
        console.log('🔚 Vapi: Sesión terminada normalmente');
        setCallStatus(prev => ({ 
          ...prev, 
          status: 'inactive',
          activeTranscript: '' 
        }));
      } else if (error.error?.type === 'ejected') {
        console.log('⚠️ Vapi: Usuario desconectado de la sesión');
        setCallStatus(prev => ({ 
          ...prev, 
          status: 'inactive',
          activeTranscript: '' 
        }));
      } else {
        console.error('🚨 Vapi: Error inesperado:', error);
        setCallStatus(prev => ({ ...prev, status: 'inactive' }));
      }
    });

    // Manejar eventos de conexión adicionales
    vapi.on('call-end', () => {
      console.log('🔴 Vapi: Llamada terminada correctamente');
      setCallStatus(prev => ({ 
        ...prev, 
        status: 'inactive',
        activeTranscript: '' 
      }));
    });

    vapi.on('volume-level', (volume: number) => {
      // Opcional: manejar niveles de volumen para efectos visuales
      // Solo loguear si hay volumen significativo para evitar spam
      if (volume > 0.1) {
        console.log('🔊 Vapi: Nivel de volumen:', volume);
      }
    });

    return () => {
      if (vapi) {
        console.log('🧹 Vapi: Limpiando conexión...');
        vapi.stop();
      }
    };
  }, [config.publicKey]);

  const start = useCallback(async () => {
    if (!vapiRef.current) return;

    try {
      setCallStatus(prev => ({ ...prev, status: 'loading' }));
      
      // Usar el Assistant ID desde la configuración, variable de entorno o fallback
      const assistantId = config.assistantId || 
                         import.meta.env.VITE_VAPI_ASSISTANT_ID || 
                         '8a540a3e-e5f2-43c9-a398-723516f8bf80';
                         
      console.log('🚀 Vapi: Iniciando llamada con Assistant ID:', assistantId);
      await vapiRef.current.start(assistantId);
      
    } catch (error) {
      console.error('❌ Vapi: Error al iniciar llamada:', error);
      setCallStatus(prev => ({ ...prev, status: 'inactive' }));
    }
  }, []);

  const stop = useCallback(() => {
    if (!vapiRef.current) return;
    
    try {
      console.log('⏹️ Vapi: Deteniendo llamada manualmente');
      vapiRef.current.stop();
      setCallStatus(prev => ({ 
        ...prev, 
        status: 'inactive', 
        activeTranscript: '' 
      }));
    } catch (error) {
      console.warn('⚠️ Vapi: Error al detener llamada (probablemente ya estaba desconectada):', error);
      setCallStatus(prev => ({ 
        ...prev, 
        status: 'inactive', 
        activeTranscript: '' 
      }));
    }
  }, []);

  const toggleCall = useCallback(() => {
    if (callStatus.status === 'active') {
      stop();
    } else {
      start();
    }
  }, [callStatus.status, start, stop]);

  return {
    isSessionActive: callStatus.status === 'active',
    isLoading: callStatus.status === 'loading',
    start,
    stop,
    toggleCall,
    messages: callStatus.messages,
    activeTranscript: callStatus.activeTranscript || ''
  };
};
