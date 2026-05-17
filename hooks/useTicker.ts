import { useEffect, useState } from 'react';

interface TickerData {
  symbol: string;
  currentPrice: number;
  vpa: number;
  lpa: number;
  lastDividend: number;
  longName?: string;
  sector?: string;
  // Adicione outros campos que seu Python retornar
}

export function useTicker(ticker: string | string[]) {
  const [tickerData, setTickerData] = useState<TickerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickerInfo = async () => {
    if (!ticker) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Ajuste a URL para a sua rota de detalhes no Python
      // Ex: http://192.168.../api/ticker/BBSE3
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/ticker/${ticker}`);
      const json = await response.json();

      if (json) {
        setTickerData(json);
      } else {
        setError("Ativo não encontrado");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickerInfo();
  }, [ticker]);

  return { tickerData, loading, error, refetch: fetchTickerInfo };
}