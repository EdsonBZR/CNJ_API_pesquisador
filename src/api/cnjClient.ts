export interface CnjSearchResult {
  hits: {
    total: {
      value: number;
    };
    hits: Array<{
      _source: {
        numeroProcesso: string;
        classe?: {
          nome: string;
        };
        assunto?: Array<{
          nome: string;
        }>;
        dataAjuizamento: string;
        orgaoJulgador?: {
          nome: string;
        };
        movimentos?: Array<{
          nome: string;
          dataHora: string;
        }>;
      };
    }>;
  };
}

export const fetchProcesso = async (
  tribunal: string,
  npu: string,
  apiKey: string
): Promise<CnjSearchResult> => {
  // Use vite proxy to bypass CORS
  const url = `/api_cnj_proxy/api_publica_${tribunal.toLowerCase()}/_search`;
  
  // Clean NPU: keep only numbers
  const cleanNpu = npu.replace(/\D/g, '');

  const payload = {
    query: {
      match: {
        numeroProcesso: cleanNpu
      }
    }
  };

  const sanitizedKey = apiKey.trim().replace(/^APIKey\s+/i, '');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `APIKey ${sanitizedKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Falha na autenticação: API Key inválida ou expirada. Verifique se copiou a chave corretamente.');
    }
    throw new Error(`Erro na API CNJ: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

export const fetchJurisprudencia = async (
  tribunal: string,
  termo: string,
  apiKey: string
): Promise<CnjSearchResult> => {
  // Use vite proxy to bypass CORS
  const url = `/api_cnj_proxy/api_publica_${tribunal.toLowerCase()}/_search`;
  
  const payload = {
    query: {
      query_string: {
        query: termo
      }
    },
    size: 5
  };

  const sanitizedKey = apiKey.trim().replace(/^APIKey\s+/i, '');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `APIKey ${sanitizedKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Falha na autenticação: API Key inválida ou expirada. Verifique se copiou a chave corretamente.');
    }
    throw new Error(`Erro na API CNJ: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};


