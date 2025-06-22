// Arquivo: src/components/Header/Header.tsx (VERSÃO COMPLETA E CORRIGIDA)

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../services/authService';

// Importações do MUI
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

// Importa o arquivo de estilo
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('Usuário');
  
  // Estado para controlar o menu do usuário
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Roda quando o componente é montado
  useEffect(() => {
    const user = getCurrentUser();
    if (user && user.username) {
      setUsername(user.username);
    }
  }, []);

  // Funções para abrir e fechar o menu
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Função de Logout
  const handleLogout = () => {
    handleClose(); // Fecha o menu
    logout();       // Executa a lógica de logout do serviço
    navigate('/login'); // Garante o redirecionamento
  };

  return (
    <AppBar position="static" className={styles.appBar}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          {/* Placeholder para o nome do módulo atual, ex: "Cadastros" */}
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>
            Bem vindo, {username.toUpperCase()}
          </Typography>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>Sair</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;