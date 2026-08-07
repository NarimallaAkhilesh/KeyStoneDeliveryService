import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Chip, TablePagination, Stack, Alert, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import AppSnackbar from '@/components/AppSnackbar';
import useApi from '@/hooks/useApi';
import useSnack from '@/hooks/useSnack';
import inventoryService from '@/services/inventoryService';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatCurrency } from '@/utils/helpers';

const EMPTY_FORM = {
  partName: '', category: '', manufacturer: '', description: '',
  unitPrice: '', quantityAvailable: '', minimumStock: 5,
};

const PartFormDialog = ({ open, onClose, onSave, initial, loading }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: initial || EMPTY_FORM });
  const isEdit = !!initial?.id;

  useEffect(() => { reset(initial || EMPTY_FORM); }, [initial, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{isEdit ? 'Edit Part' : 'Add New Part'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSave)} noValidate>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Part Name *" {...register('partName', { required: 'Required' })}
                error={!!errors.partName} helperText={errors.partName?.message} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Category" {...register('category')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Manufacturer / Supplier" {...register('manufacturer')} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Unit Price *" type="number" step="0.01"
                {...register('unitPrice', { required: 'Required', min: 0 })}
                error={!!errors.unitPrice} helperText={errors.unitPrice?.message} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Quantity Available *" type="number"
                {...register('quantityAvailable', { required: 'Required', min: 0 })}
                error={!!errors.quantityAvailable} helperText={errors.quantityAvailable?.message} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Minimum Stock Level *" type="number"
                {...register('minimumStock', { required: 'Required', min: 0 })}
                error={!!errors.minimumStock} helperText={errors.minimumStock?.message} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} {...register('description')} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" id="part-form-cancel">Cancel</Button>
          <Button type="submit" variant="contained" id="part-form-save" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

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

const PartsPage = () => {
  const { isManager } = useAuth();
  const { snack, showSuccess, showError, closeSnack } = useSnack();

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: parts, loading, error, execute: loadParts } = useApi(
    useCallback(() => inventoryService.getAllParts(statusFilter), [statusFilter])
  );
  const { data: lowStock } = useApi(inventoryService.getLowStockParts);
  const { execute: createPart, loading: creating } = useApi(inventoryService.createPart);
  const { execute: updatePart, loading: updating } = useApi(inventoryService.updatePart);
  const { execute: deletePart, loading: deleting } = useApi(inventoryService.deactivatePart);
  const { execute: restorePart }                   = useApi(inventoryService.restorePart);

  useEffect(() => { loadParts(); }, [loadParts]);

  const filtered = (parts || []).filter(p =>
    [p.partName, p.partCode, p.category, p.manufacturer]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleCreate = useCallback(async (data) => {
    try {
      await createPart({
        ...data,
        unitPrice: Number(data.unitPrice),
        quantityAvailable: Number(data.quantityAvailable),
        minimumStock: Number(data.minimumStock),
      });
      showSuccess('Part created successfully');
      setFormOpen(false);
      loadParts();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to create part'); }
  }, [createPart, loadParts, showSuccess, showError]);

  const handleUpdate = useCallback(async (data) => {
    try {
      await updatePart(editTarget.id, {
        ...data,
        unitPrice: Number(data.unitPrice),
        quantityAvailable: Number(data.quantityAvailable),
        minimumStock: Number(data.minimumStock),
      });
      showSuccess('Part updated successfully');
      setFormOpen(false); setEditTarget(null);
      loadParts();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to update part'); }
  }, [updatePart, editTarget, loadParts, showSuccess, showError]);

  const handleDelete = useCallback(async () => {
    try {
      await deletePart(deleteTarget.id);
      showSuccess('Part deactivated successfully');
      setDeleteTarget(null);
      loadParts();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to deactivate part'); }
  }, [deletePart, deleteTarget, loadParts, showSuccess, showError]);

  const handleRestore = useCallback(async (id) => {
    try {
      await restorePart(id);
      showSuccess('Part restored successfully');
      loadParts();
    } catch (e) { showError(e?.response?.data?.message || 'Failed to restore part'); }
  }, [restorePart, loadParts, showSuccess, showError]);

  if (loading) return <LoadingSpinner message="Loading parts catalog..." />;
  if (error) return <ErrorState message={error} onRetry={loadParts} />;

  return (
    <Box className="fade-in">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={3} gap={2}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Parts & Inventory</Typography>
          <Typography variant="body2" color="text.secondary">{filtered.length} part(s) | {(lowStock || []).length} low stock</Typography>
        </Box>
        {isManager && (
          <Button variant="contained" startIcon={<AddIcon />} id="add-part-btn"
            onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            Add Part
          </Button>
        )}
      </Stack>

      {(lowStock || []).length > 0 && (
        <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2, borderRadius: 2 }}>
          <strong>{(lowStock || []).length} part(s)</strong> are below minimum stock level and require restocking.
        </Alert>
      )}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #E0E7EF' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #E0E7EF', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField placeholder="Search parts..." size="small" value={search} id="parts-search"
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> }}
            sx={{ width: { xs: '100%', sm: 320 } }} />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              id="part-status-filter"
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
                <TableCell>Part Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Unit Price</TableCell>
                <TableCell>Available</TableCell>
                <TableCell>Min Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Added</TableCell>
                {isManager && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isManager ? 9 : 8} align="center" sx={{ py: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={1} color="text.secondary">
                      <InventoryIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                      <Typography>{search ? 'No parts match your search.' : 'No parts found.'}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : paginated.map((p) => {
                const isLow = (p.quantityAvailable || 0) <= (p.minimumStock || 0);
                return (
                  <TableRow key={p.id} hover sx={isLow ? { bgcolor: '#FFF8E1' } : {}}>
                    <TableCell><Chip label={p.partCode} size="small" sx={{ fontFamily: 'monospace' }} /></TableCell>
                    <TableCell><Typography variant="body2" fontWeight={600}>{p.partName}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{p.category || '—'}</Typography></TableCell>
                    <TableCell><Typography variant="body2">{formatCurrency(p.unitPrice)}</Typography></TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color={isLow ? 'error.main' : 'text.primary'}>
                        {p.quantityAvailable ?? 0}
                      </Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2">{p.minimumStock ?? 0}</Typography></TableCell>
                    <TableCell>
                      <Chip label={p.active ? (isLow ? 'Low Stock' : 'Active') : 'Inactive'} size="small"
                        color={p.active ? (isLow ? 'warning' : 'success') : 'default'} sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell><Typography variant="caption">{formatDate(p.createdAt)}</Typography></TableCell>
                    {isManager && (
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {p.active ? (
                            <>
                              <Tooltip title="Edit">
                                <IconButton size="small" id={`edit-part-${p.id}`}
                                  onClick={() => { setEditTarget(p); setFormOpen(true); }}>
                                  <EditIcon fontSize="small" color="primary" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Deactivate">
                                <IconButton size="small" id={`deactivate-part-${p.id}`} onClick={() => setDeleteTarget(p)}>
                                  <DeleteIcon fontSize="small" color="error" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <Tooltip title="Restore Part">
                              <IconButton size="small" id={`restore-part-${p.id}`} onClick={() => handleRestore(p.id)}>
                                <RestoreFromTrashIcon fontSize="small" color="success" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filtered.length} page={page} rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)} rowsPerPageOptions={[10]} />
      </Paper>

      <PartFormDialog open={formOpen} onClose={() => { setFormOpen(false); setEditTarget(null); }}
        onSave={editTarget ? handleUpdate : handleCreate} initial={editTarget} loading={creating || updating} />

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Deactivate Part" message={`Are you sure you want to deactivate "${deleteTarget?.partName}"?`} loading={deleting} />

      <AppSnackbar snack={snack} onClose={closeSnack} />
    </Box>
  );
};

export default PartsPage;
