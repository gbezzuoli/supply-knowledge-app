// Arquivo: src/pages/Login/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';

// Importações do MUI para a UI
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CoffeeIcon from '@mui/icons-material/Coffee';
import SearchIcon from '@mui/icons-material/Search';

// Importa o nosso arquivo de estilo
import styles from './Login.module.css';
import Divider from '@mui/material/Divider';

function LoginComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Usuário e senha são obrigatórios.');
      return;
    }

    try {
      await login({ username, password });
      // Navega para a página do chatbot em caso de sucesso
      navigate('/chatbot');
    } catch (err) {
      setError('Usuário ou senha inválidos.');
      console.error('Falha no login:', err);
    }
  };

return (
  <div className={styles.pageContainer}>
    {/* Painel Esquerdo com o Formulário */}
    <div className={styles.leftPanel}>
      <div className={styles.formWrapper}>
        <div className={styles.logoArea}>
          {/* Coloque seu logo aqui. Por enquanto, um placeholder. */}
          <img src="/logopadrao.svg" alt="Logo" className={styles.logo} />
          <Typography variant="h5" component="h1" className={styles.title}>
            CHAT-BOT (Guilherme Ramos)
          </Typography>
        </div>

        <Card className={styles.loginCard}>
          <CardHeader
            avatar={<CoffeeIcon sx={{ color: '#757575' }} />}
            title="Por favor, forneça suas credenciais"
            titleTypographyProps={{ variant: 'body1', color: '#424242' }}
          />
          <CardContent>
            <Box component="form" onSubmit={handleLogin} noValidate>
              <TextField
                margin="dense"
                required
                fullWidth
                label="Usuário ou E-mail"
                variant="filled"
                size="small"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                margin="dense"
                required
                fullWidth
                label="Senha"
                type="password"
                variant="filled"
                size="small"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {/* O campo de seleção de empresa pode ser adicionado aqui depois */}
              {error && (
                <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </Box>
          </CardContent>
          <CardActions className={styles.cardActions}>
            <a href="#" className={styles.forgotPassword}>Esqueceu a senha?</a>
            <Button
              type="submit"
              variant="contained"
              onClick={handleLogin}
              className={styles.loginButton}
            >
              Entrar
            </Button>
          </CardActions>
          <Divider />
<CardContent>
  <Typography variant="body2" align="center">
    Não tem uma conta? <a href="/signup" className={styles.signupLink}>Cadastre-se agora</a>
  </Typography>
</CardContent>
{/* --- FIM DA SEÇÃO NOVA --- */}
        </Card>
      </div>
      {/* Elemento decorativo da onda laranja */}
      <div className={styles.wave}></div>
    </div>

    {/* Painel Direito (apenas visual) */}
    <div className={styles.rightPanel}></div>
  </div>
  );
}

export default LoginComponent;