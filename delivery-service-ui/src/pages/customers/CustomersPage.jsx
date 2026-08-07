import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Chip, TablePagination, Stack, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import RefreshIcon from '@mui/icons-material/Refresh';

import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import AppSnackbar from '@/components/AppSnackbar';
import useApi from '@/hooks/useApi';
import useSnack from '@/hooks/useSnack';
import customerService from '@/services/customerService';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/helpers';

// ── Field names MUST match CustomerRequestDTO / CustomerUpdateDTO exactly ──────
// Backend: customerName, companyName, email, phone, alternatePhone,
//          address, city, state, country, pincode, gstNumber
const EMPTY_FORM = {
  customerName:   '',
  companyName:    '',
  email:          '',
  phone:          '',
  alternatePhone: '',
  address:        '',
  city:           '',
  state:          '',
  country:        'India',
  pincode:        '',   // ← was 'postalCode' — FIXED to match backend DTO
  gstNumber:      '',
};

// ─── Customer Form Dialog ─────────────────────────────────────────────────────
const CustomerFormDialog = ({ open, onClose, onSave, initial, loading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: initial || EMPTY_FORM,
  });
  const isEdit = !!initial?.id;

  useEffect(() => {
    reset(initial || EMPTY_FORM);
  }, [initial, reset, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {isEdit ? 'Edit Customer' : 'Add New Customer'}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSave)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>

            {/* Row 1: Customer Name + Company Name */}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Customer / Contact Name *"
                id="cust-name-input"
                {...register('customerName', { required: 'Customer name is required' })}
                error={!!errors.customerName}
                helperText={errors.customerName?.message} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Company Name"
                id="cust-company-input"
                {...register('companyName')} />
            </Grid>

            {/* Row 2: Email + Phone */}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email Address *" type="email"
                id="cust-email-input"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' },
                })}
                error={!!errors.email}
                helperText={errors.email?.message} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number * (10 digits)"
                id="cust-phone-input"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: { value: /^[0-9]{10}$/, message: 'Must be exactly 10 digits' },
                })}
                error={!!errors.phone}
                helperText={errors.phone?.message} />
            </Grid>

            {/* Row 3: Alternate Phone + GST Number */}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Alternate Phone"
                id="cust-alt-phone-input"
                {...register('alternatePhone')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="GST Number"
                id="cust-gst-input"
                {...register('gstNumber')} />
            </Grid>

            {/* Row 4: Full Address */}
            <Grid item xs={12}>
              <TextField fullWidth label="Address *"
                id="cust-address-input"
                {...register('address', { required: 'Address is required' })}
                error={!!errors.address}
                helperText={errors.address?.message} />
            </Grid>

            {/* Row 5: City, State, Country */}
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="City *"
                id="cust-city-input"
                {...register('city', { required: 'City is required' })}
                error={!!errors.city}
                helperText={errors.city?.message} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="State *"
                id="cust-state-input"
                {...register('state', { required: 'State is required' })}
                error={!!errors.state}
                helperText={errors.state?.message} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Country *"
                id="cust-country-input"
                {...register('country', { required: 'Country is required' })}
                error={!!errors.country}
                helperText={errors.country?.message} />
            </Grid>

            {/* Row 6: Pincode */}
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Pincode / Postal Code"
                id="cust-pincode-input"
                {...register('pincode')} />
            </Grid>

          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" id="customer-form-cancel">Cancel</Button>
          <Button type="submit" variant="contained" id="customer-form-save" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

// ─── Confirm Deactivate Dialog ────────────────────────────────────────────────
const ConfirmDialog = ({ open, onClose, onConfirm, title, message, loading }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
    <DialogTitle fontWeight={700}>{title}</DialogTitle>
    <DialogContent><Typography>{message}</Typography></DialogContent>
    <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
      <Button onClick={onClose} variant="outlined" id="confirm-cancel">Cancel</Button>
      <Button onClick={onConfirm} variant="contained" color="error" id="confirm-delete" disabled={loading}>
        {loading ? 'Processing...' : 'Deactivate'}
      </Button>
    </DialogActions>
  </Dialog>
);

// ─── Main Customers Page ──────────────────────────────────────────────────────
const CustomersPage = () => {
  const { isManager } = useAuth();
  const { snack, showSuccess, showError, closeSnack } = useSnack();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(0);
  const [rowsPerPage]           = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: customers, loading, error, execute: loadCustomers } = useApi(
    useCallback(() => customerService.getAll(statusFilter), [statusFilter])
  );
  const { execute: createCustomer, loading: creating }   = useApi(customerService.create);
  const { execute: updateCustomer, loading: updating }   = useApi(customerService.update);
  const { execute: deleteCustomer, loading: deleting }   = useApi(customerService.deactivate);
  const { execute: restoreCustomer }                     = useApi(customerService.restore);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const filtered = (customers || []).filter(c =>
    [c.customerName, c.companyName, c.email, c.phone, c.customerCode]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Build the form initial values from the customer response object
  // Mapping response fields → form field names (must match DTO exactly)
  const buildEditInitial = (c) => ({
    id:             c.id,
    customerName:   c.customerName   || '',
    companyName:    c.companyName    || '',
    email:          c.email          || '',
    phone:          c.phone          || '',
    alternatePhone: c.alternatePhone || '',
    address:        c.address        || '',
    city:           c.city           || '',
    state:          c.state          || '',
    country:        c.country        || '',
    pincode:        c.pincode        || '',   // ← correct field name
    gstNumber:      c.gstNumber      || '',
  });

  const handleCreate = useCallback(async (data) => {
    try {
      await createCustomer(data);
      showSuccess('Customer created successfully');
      setFormOpen(false);
      loadCustomers();
    } catch (e) {
      const apiData = e?.response?.data;
      if (apiData?.data && typeof apiData.data === 'object') {
        showError(Object.values(apiData.data).join(', '));
      } else {
        showError(apiData?.message || 'Failed to create customer');
      }
    }
  }, [createCustomer, loadCustomers, showSuccess, showError]);

  const handleUpdate = useCallback(async (data) => {
    try {
      await updateCustomer(editTarget.id, data);
      showSuccess('Customer updated successfully');
      setFormOpen(false);
      setEditTarget(null);
      loadCustomers();
    } catch (e) {
      const apiData = e?.response?.data;
      if (apiData?.data && typeof apiData.data === 'object') {
        showError(Object.values(apiData.data).join(', '));
      } else {
        showError(apiData?.message || 'Failed to update customer');
      }
    }
  }, [updateCustomer, editTarget, loadCustomers, showSuccess, showError]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteCustomer(deleteTarget.id);
      showSuccess('Customer deactivated successfully');
      setDeleteTarget(null);
      loadCustomers();
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to deactivate customer');
    }
  }, [deleteCustomer, deleteTarget, loadCustomers, showSuccess, showError]);

  const handleRestore = useCallback(async (id) => {
    try {
      await restoreCustomer(id);
      showSuccess('Customer restored successfully');
      loadCustomers();
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to restore customer');
    }
  }, [restoreCustomer, loadCustomers, showSuccess, showError]);

  if (loading) return <LoadingSpinner message="Loading customers..." />;
  if (error)   return <ErrorState message={error} onRetry={loadCustomers} />;

  return (
    <Box className="fade-in">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Customers</Typography>
          <Typography variant="body2" color="text.secondary">{filtered.length} customer(s) found</Typography>
        </Box>
        <Stack direction="row" gap={1}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadCustomers} id="customer-refresh-btn">
            Refresh
          </Button>
          {isManager && (
            <Button variant="contained" startIcon={<AddIcon />} id="add-customer-btn"
              onClick={() => { setEditTarget(null); setFormOpen(true); }}>
              Add Customer
            </Button>
          )}
        </Stack>
      </Stack>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E0E7EF' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E0E7EF', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search customers..."
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            id="customer-search"
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment>,
            }}
            sx={{ width: { xs: '100%', sm: 320 } }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              id="customer-status-filter"
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">Active Only</MenuItem>
              <MenuItem value="INACTIVE">Inactive Only</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                {isManager && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isManager ? 8 : 7} align="center" sx={{ py: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                      <BusinessIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                      <Typography>{search ? 'No customers match your search.' : 'No customers found.'}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginated.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell><Chip label={c.customerCode} size="small" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }} /></TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{c.customerName}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.companyName}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2">{c.email}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{c.phone}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{c.city || '—'}</Typography></TableCell>
                  <TableCell>
                    <Chip label={c.active ? 'Active' : 'Inactive'} size="small"
                      color={c.active ? 'success' : 'default'} sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell><Typography variant="caption">{formatDate(c.createdAt)}</Typography></TableCell>
                  {isManager && (
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {c.active ? (
                          <>
                            <Tooltip title="Edit Customer">
                              <IconButton size="small" id={`edit-customer-${c.id}`}
                                onClick={() => { setEditTarget(buildEditInitial(c)); setFormOpen(true); }}>
                                <EditIcon fontSize="small" color="primary" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Deactivate Customer">
                              <IconButton size="small" id={`deactivate-customer-${c.id}`}
                                onClick={() => setDeleteTarget(c)}>
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Restore Customer">
                            <IconButton size="small" id={`restore-customer-${c.id}`}
                              onClick={() => handleRestore(c.id)}>
                              <RestoreFromTrashIcon fontSize="small" color="success" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPageOptions={[10]}
        />
      </Paper>

      <CustomerFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSave={editTarget ? handleUpdate : handleCreate}
        initial={editTarget}
        loading={creating || updating}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Deactivate Customer"
        message={`Are you sure you want to deactivate "${deleteTarget?.customerName}"? They will be moved to the inactive list.`}
        loading={deleting}
      />

      <AppSnackbar snack={snack} onClose={closeSnack} />
    </Box>
  );
};

export default CustomersPage;
