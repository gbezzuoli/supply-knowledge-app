// Arquivo: src/pages/DebugSearch/DebugSearch.tsx
import { useState } from 'react';
import { debugSearch } from '../../services/dataService';
import { Box, Typography, TextField, Button, CircularProgress, Paper, Alert } from '@mui/material';

const DebugSearchComponent = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    setIsLoading(true);
    setResults(null);
    try {
      const data = await debugSearch(query);
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Diagnóstico de Busca Vetorial</Typography>
      <Alert severity="warning" sx={{ mb: 2 }}>
        Esta ferramenta mostra exatamente o que o ChromaDB retorna para uma dada pergunta, incluindo a pontuação de similaridade (distância).
      </Alert>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField fullWidth label="Pergunta do Usuário" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button variant="contained" onClick={handleSearch} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Diagnosticar'}
        </Button>
      </Box>

      {results && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Query Enviada: "{results.query}"</Typography>
          <hr />
          {results.results.map((item: any, index: number) => (
            <Box key={item.id} sx={{ mb: 2, p: 1, border: '1px solid #ccc', borderRadius: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Resultado #{index + 1} (Distância: {item.distance.toFixed(4)})
              </Typography>
              <Typography variant="body2"><strong>ID:</strong> {item.id}</Typography>
              <Typography variant="body2"><strong>Pergunta Armazenada:</strong> {item.metadata.pergunta}</Typography>
              <Typography variant="body2"><strong>Documento:</strong> {item.document}</Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default DebugSearchComponent;