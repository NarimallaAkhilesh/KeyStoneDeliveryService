import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Grid, Box,
} from '@mui/material';
import { PRIORITIES } from '@/utils/constants';

const EditRequestDialog = ({ open, onClose, onSubmit, loading, sites, request }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (open && request) {
      reset({
        title: request.title || '',
        description: request.description || '',
        priority: request.priority || 'MEDIUM',
        siteId: request.siteId || '',
      });
    }
  }, [open, request, reset]);

  const handleFormSubmit = (data) => {
    onSubmit({
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      priority: data.priority,
      siteId: data.siteId ? Number(data.siteId) : null,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle fontWeight={700}>Edit Service Request</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Request Title *"
                {...register('title', { required: 'Title is required' })}
                error={!!errors.title}
                helperText={errors.title?.message}
                id="edit-req-title"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                {...register('description')}
                id="edit-req-desc"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Priority *"
                defaultValue={request?.priority || 'MEDIUM'}
                {...register('priority', { required: 'Priority is required' })}
                error={!!errors.priority}
                helperText={errors.priority?.message}
                id="edit-req-priority"
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Site *"
                defaultValue={request?.siteId || ''}
                {...register('siteId', { required: 'Site is required' })}
                error={!!errors.siteId}
                helperText={errors.siteId?.message}
                id="edit-req-site"
              >
                {(sites || []).map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.siteName} ({s.siteCode})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" id="edit-req-cancel">
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading} id="edit-req-submit">
            {loading ? 'Saving...' : 'Update Request'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default EditRequestDialog;
