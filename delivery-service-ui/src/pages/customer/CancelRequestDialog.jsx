import { useForm } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Alert, Box,
} from '@mui/material';

const CancelRequestDialog = ({ open, onClose, onConfirm, loading, requestNumber }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { cancellationReason: '' } });

  const handleFormSubmit = (data) => {
    onConfirm(data.cancellationReason.trim());
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle fontWeight={700} color="error.main">
        Cancel Service Request
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent dividers>
          <Typography variant="body2" mb={2}>
            Are you sure you want to cancel service request <strong>{requestNumber}</strong>?
          </Typography>

          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            This action cannot be undone once cancelled.
          </Alert>

          <TextField
            fullWidth
            label="Cancellation Reason *"
            placeholder="Please explain why you are cancelling this request..."
            multiline
            rows={3}
            {...register('cancellationReason', {
              required: 'Cancellation reason is required',
              minLength: { value: 5, message: 'Reason must be at least 5 characters long' },
            })}
            error={!!errors.cancellationReason}
            helperText={errors.cancellationReason?.message}
            id="cancel-req-reason"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" id="cancel-req-close">
            Go Back
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="error"
            disabled={loading}
            id="cancel-req-confirm"
          >
            {loading ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CancelRequestDialog;
