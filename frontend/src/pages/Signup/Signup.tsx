// Arquivo: src/pages/Signup/Signup.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../../services/authService';
import styles from './Signup.module.css'; // Reutilizando o mesmo estilo do login

// Importações do MUI
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CoffeeIcon from '@mui/icons-material/Coffee';

function SignupComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!username || !password) {
      setError('Usuário e senha são obrigatórios.');
      return;
    }

    try {
      const response = await signup({ username, password });
      setMessage(response.message || 'Usuário criado com sucesso! Redirecionando para o login...');
      // Espera 3 segundos e redireciona para a tela de login
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      // Pega a mensagem de erro específica do nosso backend
      setError(err.response?.data?.message || 'Erro desconhecido ao criar usuário.');
      console.error("Falha no cadastro:", err);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.formWrapper}>
          <div className={styles.logoArea}>
            <img src="/logopadrao.svg" alt="Logo" className={styles.logo} />
            <Typography variant="h5" component="h1" className={styles.title}>
              CHAT-BOT (Guilherme Ramos)
            </Typography>
          </div>

          <Card className={styles.loginCard}>
            <CardHeader
              avatar={<CoffeeIcon sx={{ color: '#757575' }} />}
              title="Criar Nova Conta"
            />
            <CardContent>
              <Box component="form" onSubmit={handleSignup} noValidate>
                <TextField
                  margin="dense" required fullWidth label="Novo Usuário"
                  value={username} onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                  margin="dense" required fullWidth label="Nova Senha" type="password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
                {/* Mensagens de feedback para o usuário */}
                {error && <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>{error}</Typography>}
                {message && <Typography color="primary" variant="body2" align="center" sx={{ mt: 2 }}>{message}</Typography>}
              </Box>
            </CardContent>
            <CardActions className={styles.cardActions}>
              <a href="/login" className={styles.forgotPassword}>Voltar para o Login</a>
              <Button type="submit" variant="contained" onClick={handleSignup} className={styles.loginButton}>
                Cadastrar
              </Button>
            </CardActions>
          </Card>
        </div>
        <div className={styles.wave}></div>
      </div>
      <div className={styles.rightPanel}></div>
    </div>
  );
}

export default SignupComponent;