import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import './AccessCodePanel.css';

const AccessCodePanel = ({ accessCode }) => {
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(accessCode)
      .then(() => {
        setSnackbarOpen(true);
      })
      .catch(err => {
        console.error('Copy failed:', err);
        setError('Не удалось скопировать код доступа');
      });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <div className="access-panel-container">
      <IconButton
        color="primary"
        className="access-code-icon"
        onClick={() => setOpen(true)}
        aria-label="Показать код доступа"
      >
        <VpnKeyIcon fontSize="large" />
      </IconButton>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Код доступа к конференции</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={accessCode}
            margin="normal"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton onClick={handleCopy}>
                  <ContentCopyIcon />
                </IconButton>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Код доступа скопирован в буфер обмена!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AccessCodePanel;