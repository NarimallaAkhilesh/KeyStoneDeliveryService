import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Grid, Box, Typography, Alert, Autocomplete,
} from '@mui/material';
import { PRIORITIES } from '@/utils/constants';

const DEFAULT_FORM = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  siteId: '',
};

const RaiseRequestDialog = ({ open, onClose, onSubmit, loading, sites, customer }) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_FORM });

  useEffect(() => {
    if (open) {
      reset(DEFAULT_FORM);
    }
  }, [open, reset]);

  const handleFormSubmit = (data) => {
    const payload = {
      title: data.title.trim(),
      description: data.description ? data.description.trim() : '',
      priority: data.priority,
      customerId: customer?.id,
      siteId: data.siteId ? Number(data.siteId) : null,
    };
    onSubmit(payload);
  };

  const siteOptions = Array.isArray(sites)
    ? sites.filter(s => s && s.active !== false)
    : (sites?.data && Array.isArray(sites.data) ? sites.data.filter(s => s && s.active !== false) : []);

  useEffect(() => {
    if (open) {
      console.log('[RaiseRequestDialog] Customer profile:', customer);
      console.log('[RaiseRequestDialog] Customer ID:', customer?.id);
      console.log('[RaiseRequestDialog] Sites response raw:', sites);
      console.log('[RaiseRequestDialog] Parsed options array:', siteOptions);
    }
  }, [open, customer, sites, siteOptions]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle fontWeight={700}>Raise Service Request</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <DialogContent dividers sx={{ overflowY: 'visible' }}>
          {customer && (
            <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
              Request will be registered under customer <strong>{customer.customerName}</strong> ({customer.customerCode}).
            </Alert>
          )}

          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Request Title *"
                placeholder="e.g. HVAC cooling failure on 3rd floor"
                helperText={errors.title?.message || "Provide a brief title for your request"}
                {...register('title', { required: 'Title is required' })}
                error={!!errors.title}
                id="raise-req-title"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                placeholder="Describe the issue or service request in detail..."
                helperText="Specific details, room numbers, or equipment IDs"
                multiline
                rows={3}
                {...register('description')}
                id="raise-req-desc"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Priority *"
                defaultValue="MEDIUM"
                helperText="Choose request priority"
                {...register('priority', { required: 'Priority is required' })}
                error={!!errors.priority}
                id="raise-req-priority"
              >
                {PRIORITIES.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="siteId"
                control={control}
                rules={{ required: 'Site selection is required' }}
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                  const selectedSite = siteOptions.find(s => String(s.id) === String(value)) || null;
                  return (
                    <Autocomplete
                      options={siteOptions}
                      getOptionLabel={(option) =>
                        typeof option === 'object' && option !== null
                          ? `${option.siteName || ''} (${option.siteCode || ''})`
                          : ''
                      }
                      value={selectedSite}
                      onChange={(_, newValue) => {
                        onChange(newValue ? newValue.id : '');
                      }}
                      isOptionEqualToValue={(option, val) =>
                        !!val && String(option.id) === String(val.id)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Site *"
                          placeholder="Search site location"
                          error={!!error}
                          helperText={error?.message || (siteOptions.length === 0 ? "No active sites available for customer" : "Select customer site")}
                          id="raise-req-site"
                        />
                      )}
                      slotProps={{ popper: { sx: { zIndex: 1400 } } }}
                    />
                  );
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" id="raise-req-cancel">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            id="raise-req-submit"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default RaiseRequestDialog;
