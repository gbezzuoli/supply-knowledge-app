// Arquivo: src/pages/ViewBase/ViewBase.tsx (VERSÃO FINAL)
import { useState } from 'react';
import { inspectCollection } from '../../services/dataService';
import styles from './ViewBase.module.css';

// Importações do MUI
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

type DbItem = {
  ID: string;
  Pergunta: string;
  Resposta: string;
  Visitante: string;
  Tags: string;
};

const ViewBaseComponent = () => {
  const [selectedCollection, setSelectedCollection] = useState('chatbot_documentacao'); // <-- Padrão para a coleção do FLUX
  const [data, setData] = useState<DbItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLoad = async () => {
    setIsLoading(true);
    setMessage('');
    setData([]);
    try {
      const result = await inspectCollection(selectedCollection);
      setData(result.items);
      setMessage(`Dados carregados com sucesso! Encontrados ${result.count} documentos.`);
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Erro ao carregar os dados.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Visualizar Base de Dados Indexada
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Esta tela mostra o conteúdo que está atualmente no banco de dados vetorial.
      </Alert>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Select
          value={selectedCollection}
          onChange={(e: SelectChangeEvent) => setSelectedCollection(e.target.value)}
          size="small"
        >
          <MenuItem value="chatbot_resolucoes">Resoluções de Chat</MenuItem>
          <MenuItem value="chatbot_documentacao">Documentação (FLUX)</MenuItem>
          <MenuItem value="agent_actions">Ações do Agente (Micro)</MenuItem>
        </Select>
        <Button variant="contained" onClick={handleLoad} disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Carregar e Exibir Conteúdo'}
        </Button>
      </Box>

      {message && <Alert severity={data.length > 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>{message}</Alert>}

      {data.length > 0 && (
        <TableContainer component={Paper}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Pergunta</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Resposta</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Visitante/Fonte</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tags</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.ID} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{row.ID}</TableCell>
                  <TableCell>{row.Pergunta}</TableCell>
                  <TableCell>{row.Resposta}</TableCell>
                  <TableCell>{row.Visitante}</TableCell>
                  <TableCell>{row.Tags}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ViewBaseComponent;