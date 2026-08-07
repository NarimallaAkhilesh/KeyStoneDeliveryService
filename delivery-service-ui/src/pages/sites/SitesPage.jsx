import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Chip, TablePagination, Stack, MenuItem,
  Select, FormControl, InputLabel, Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import AppSnackbar from '@/components/AppSnackbar';
import useApi from '@/hooks/useApi';
import useSnack from '@/hooks/useSnack';
import siteService from '@/services/siteService';
import customerService from '@/services/customerService';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/helpers';

// ─── IMPORTANT: field names must match SiteRequestDTO / SiteUpdateDTO exactly ───
const EMPTY_FORM = {
  siteName: '',
  customerId: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',          // ← must match backend DTO field "pincode" (NOT postalCode)
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
};

// ─── Add / Edit Site Dialog ───────────────────────────────────────────────────
const SiteFormDialog = ({ open, onClose, onSave, initial, loading, customers }) => {
  const {
    register, handleSubmit, reset, control, formState: { errors },
  } = useForm({ defaultValues: initial || EMPTY_FORM });

  const isEdit = !!initial?.id;

  useEffect(() => {
    // When dialog opens, reset to the passed initial values (or blank form)
    reset(initial || EMPTY_FORM);
  }, [initial, reset, open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {isEdit ? 'Edit Site' : 'Add New Site'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSave)} noValidate>
        {/* scroll="paper" + DialogContent without overflow:visible ensures the
            Autocomplete Popper renders via Portal above the dialog, not clipped */}
        <DialogContent dividers>
          <Grid container spacing={2.5}>

            {/* Row 1: Site Name + Customer */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Site Name *"
                placeholder="e.g. Hyderabad Plant"
                helperText={errors.siteName?.message || 'Enter a unique site identifier name'}
                error={!!errors.siteName}
                id="site-name-input"
                {...register('siteName', { required: 'Site name is required' })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="customerId"
                control={control}
                rules={{ required: 'Customer selection is required' }}
                render={({ field: { onChange, value }, fieldState: { error } }) => {
                  const selectedCustomer =
                    (customers || []).find((c) => String(c.id) === String(value)) || null;
                  return (
                    <Autocomplete
                      options={customers || []}
                      getOptionLabel={(option) =>
                        option ? `${option.customerName} (${option.customerCode})` : ''
                      }
                      value={selectedCustomer}
                      onChange={(_, newValue) => onChange(newValue ? newValue.id : '')}
                      isOptionEqualToValue={(option, val) =>
                        String(option.id) === String(val.id)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Customer *"
                          placeholder="Search customer by name or code..."
                          error={!!error}
                          helperText={error?.message || 'Select the customer who owns this site'}
                          id="site-customer-select"
                        />
                      )}
                      slotProps={{
                        popper: {
                          // Render above the dialog (MUI Dialog z-index is 1300)
                          sx: { zIndex: 1400 },
                        },
                      }}
                    />
                  );
                }}
              />
            </Grid>

            {/* Row 2: Full Address */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address *"
                placeholder="e.g. 4th Floor, Tower B, Hitech City"
                helperText={errors.address?.message || 'Enter the complete street address'}
                error={!!errors.address}
                id="site-address-input"
                {...register('address', { required: 'Address is required' })}
              />
            </Grid>

            {/* Row 3: City, State, Country */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                placeholder="e.g. Hyderabad"
                helperText="City where the site is located"
                id="site-city-input"
                {...register('city')}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                placeholder="e.g. Telangana"
                helperText="State / Province"
                id="site-state-input"
                {...register('state')}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Country"
                placeholder="e.g. India"
                helperText="Country"
                id="site-country-input"
                {...register('country')}
              />
            </Grid>

            {/* Row 4: Pincode */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Postal Code"
                placeholder="e.g. 500081"
                helperText="6-digit postal / ZIP code"
                id="site-pincode-input"
                {...register('pincode')}       // ← MUST be "pincode" to match backend DTO
              />
            </Grid>

            {/* Row 5: Contact Person, Phone, Email */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Contact Person"
                placeholder="e.g. John Smith"
                helperText="On-site point of contact"
                id="site-contact-person-input"
                {...register('contactPerson')}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Contact Phone"
                placeholder="e.g. 9876543210"
                helperText={errors.contactPhone?.message || '10-digit mobile number'}
                error={!!errors.contactPhone}
                id="site-contact-phone-input"
                {...register('contactPhone', {
                  // Allow empty OR exactly 10 digits
                  pattern: {
                    value: /^$|^[0-9]{10}$/,
                    message: 'Phone number must be exactly 10 digits',
                  },
                })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                placeholder="e.g. contact@company.com"
                helperText={errors.contactEmail?.message || 'Business email address'}
                error={!!errors.contactEmail}
                id="site-contact-email-input"
                {...register('contactEmail', {
                  pattern: {
                    value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
              />
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" id="site-form-cancel">
            Cancel
          </Button>
          <Button type="submit" variant="contained" id="site-form-save" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Site' : 'Create Site'}
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

// ─── Main Sites Page ──────────────────────────────────────────────────────────
const SitesPage = () => {
  const { isManager } = useAuth();
  const { snack, showSuccess, showError, closeSnack } = useSnack();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: sites, loading, error, execute: loadSites } = useApi(
    useCallback(() => siteService.getAll(statusFilter), [statusFilter])
  );
  const { data: customers, execute: loadCustomers } = useApi(customerService.getAll);
  const { execute: createSite, loading: creating } = useApi(siteService.create);
  const { execute: updateSite, loading: updating } = useApi(siteService.update);
  const { execute: deleteSite, loading: deleting } = useApi(siteService.deactivate);
  const { execute: restoreSite } = useApi(siteService.restore);

  useEffect(() => { loadSites(); loadCustomers(); }, [loadSites, loadCustomers]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPage(0);
  };

  const filtered = (sites || []).filter((s) =>
    [s.siteName, s.siteCode, s.city, s.customerName]
      .some((f) => f?.toLowerCase().includes(search.toLowerCase()))
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Build the payload — map "pincode" correctly, cast customerId to number
  const buildPayload = (data) => ({
    ...data,
    customerId: Number(data.customerId),
    pincode: data.pincode || null,
    city: data.city || null,
    state: data.state || null,
    country: data.country || null,
    contactPerson: data.contactPerson || null,
    contactPhone: data.contactPhone || null,
    contactEmail: data.contactEmail || null,
    // latitude and longitude are NOT collected — omit them (backend accepts null)
    latitude: null,
    longitude: null,
  });

  const handleCreate = useCallback(async (data) => {
    try {
      await createSite(buildPayload(data));
      showSuccess('Site created successfully');
      setFormOpen(false);
      loadSites();
    } catch (e) {
      const apiData = e?.response?.data;
      if (apiData?.data && typeof apiData.data === 'object') {
        // Field-level validation errors — join them
        const msgs = Object.values(apiData.data).join(', ');
        showError(msgs);
      } else {
        showError(apiData?.message || 'Failed to create site');
      }
    }
  }, [createSite, loadSites, showSuccess, showError]);

  const handleUpdate = useCallback(async (data) => {
    try {
      const payload = buildPayload(data);
      await updateSite(editTarget.id, payload);
      showSuccess('Site updated successfully');
      setFormOpen(false);
      setEditTarget(null);
      await loadSites();
    } catch (e) {
      const apiData = e?.response?.data;
      if (apiData?.data && typeof apiData.data === 'object') {
        const msgs = Object.values(apiData.data).join(', ');
        showError(msgs);
      } else {
        showError(apiData?.message || 'Failed to update site');
      }
    }
  }, [updateSite, editTarget, loadSites, showSuccess, showError]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteSite(deleteTarget.id);
      showSuccess('Site deactivated successfully');
      setDeleteTarget(null);
      loadSites();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to deactivate site'); }
  }, [deleteSite, deleteTarget, loadSites, showSuccess, showError]);

  const handleRestore = useCallback(async (id) => {
    try {
      await restoreSite(id);
      showSuccess('Site restored successfully');
      loadSites();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to restore site'); }
  }, [restoreSite, loadSites, showSuccess, showError]);

  if (loading) return <LoadingSpinner message="Loading sites..." />;
  if (error)   return <ErrorState message={error} onRetry={loadSites} />;

  return (
    <Box className="fade-in">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        mb={3}
        gap={2}
      >
        <Box>
          <Typography variant="h5" fontWeight={800}>Sites</Typography>
          <Typography variant="body2" color="text.secondary">
            {filtered.length} site(s) found
          </Typography>
        </Box>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadSites}
            id="site-refresh-btn"
          >
            Refresh
          </Button>
          {isManager && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              id="add-site-btn"
              onClick={() => { setEditTarget(null); setFormOpen(true); }}
            >
              Add Site
            </Button>
          )}
        </Stack>
      </Stack>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E0E7EF' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E0E7EF', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by name, code, city, customer..."
            size="small"
            value={search}
            id="site-search"
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 240 }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              id="site-status-filter"
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">Active Only</MenuItem>
              <MenuItem value="INACTIVE">Inactive Only</MenuItem>
            </Select>
          </FormControl>

          {(search || statusFilter !== 'ALL') && (
            <Button
              variant="text"
              color="secondary"
              startIcon={<FilterAltOffIcon />}
              onClick={handleResetFilters}
              id="site-reset-filters"
            >
              Reset
            </Button>
          )}
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Site Code</TableCell>
                <TableCell>Site Name</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Contact</TableCell>
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
                      <LocationOnIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                      <Typography>
                        {search ? 'No sites match your search.' : 'No sites found. Add your first site.'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginated.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Chip label={s.siteCode} size="small" sx={{ fontFamily: 'monospace' }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{s.siteName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{s.customerName || '—'}</Typography>
                    {s.customerCode && (
                      <Typography variant="caption" color="text.secondary">({s.customerCode})</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{s.city || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{s.contactPerson || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">{s.contactPhone || ''}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={s.active ? 'Active' : 'Inactive'}
                      size="small"
                      color={s.active ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{formatDate(s.createdAt)}</Typography>
                  </TableCell>
                  {isManager && (
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {s.active ? (
                          <>
                            <Tooltip title="Edit Site">
                              <IconButton
                                size="small"
                                id={`edit-site-${s.id}`}
                                onClick={() => {
                                  // Map backend response fields back to form field names
                                  setEditTarget({
                                    id: s.id,
                                    siteName: s.siteName || '',
                                    customerId: s.customerId || '',
                                    address: s.address || '',
                                    city: s.city || '',
                                    state: s.state || '',
                                    country: s.country || '',
                                    pincode: s.pincode || '',  // ← map "pincode" (not postalCode)
                                    contactPerson: s.contactPerson || '',
                                    contactPhone: s.contactPhone || '',
                                    contactEmail: s.contactEmail || '',
                                  });
                                  setFormOpen(true);
                                }}
                              >
                                <EditIcon fontSize="small" color="primary" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Deactivate Site">
                              <IconButton
                                size="small"
                                id={`deactivate-site-${s.id}`}
                                onClick={() => setDeleteTarget(s)}
                              >
                                <DeleteIcon fontSize="small" color="error" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Restore Site">
                            <IconButton
                              size="small"
                              id={`restore-site-${s.id}`}
                              onClick={() => handleRestore(s.id)}
                            >
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

      <SiteFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSave={editTarget ? handleUpdate : handleCreate}
        initial={editTarget}
        loading={creating || updating}
        customers={customers || []}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Deactivate Site"
        message={`Are you sure you want to deactivate "${deleteTarget?.siteName}"? It can be restored later.`}
        loading={deleting}
      />

      <AppSnackbar snack={snack} onClose={closeSnack} />
    </Box>
  );
};

export default SitesPage;
