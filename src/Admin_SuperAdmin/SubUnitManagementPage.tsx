import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Tab,
  Button,
  TextField,
  Box,
  Paper,
  InputAdornment,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { SaveIcon } from 'lucide-react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  createSubUnit,
  fetchAllSubUnits,
  updateSubUnitById,
  fetchAllUnits
} from '../services/api';

interface SubUnit {
  id: number;
  name: string;
  unitId: number;
  unitName?: string;
}

interface Unit {
  id: number;
  name: string;
}

const SubUnitManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  const [subUnits, setSubUnits] = useState<SubUnit[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredSubUnits, setFilteredSubUnits] = useState<SubUnit[]>([]);
  const [formData, setFormData] = useState<{ name: string; unitId: number }>({ name: '', unitId: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [currentSubUnitId, setCurrentSubUnitId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSubUnits = async () => {
    setLoading(true);
    try {
      const response = await fetchAllSubUnits();
      const data = response?.data?.data || [];
      setSubUnits(data);
      setFilteredSubUnits(data);
    } catch (error) {
      console.error('Error fetching sub-units:', error);
      setSubUnits([]);
      setFilteredSubUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitsList = async () => {
    try {
      const response = await fetchAllUnits();
      setUnits(response?.data?.data || []);
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]);
    }
  };

  useEffect(() => {
    fetchUnitsList();
    if (activeTab === 'view') fetchSubUnits();
  }, [activeTab]);

  useEffect(() => {
    const filtered = subUnits.filter(subUnit =>
      subUnit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubUnits(filtered);
  }, [searchTerm, subUnits]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      unitId: Number(value)
    }));
  };

  const handleClear = () => {
    setFormData({ name: '', unitId: 0 });
    setIsEditing(false);
    setCurrentSubUnitId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentSubUnitId) {
        await updateSubUnitById(currentSubUnitId, formData);
      } else {
        await createSubUnit(formData);
      }
      handleClear();
      if (activeTab === 'view') fetchSubUnits();
      setActiveTab('view');
    } catch (error) {
      console.error('Error saving sub-unit:', error);
    }
  };

  const handleEdit = (subUnit: SubUnit) => {
    setFormData({ name: subUnit.name, unitId: subUnit.unitId });
    setIsEditing(true);
    setCurrentSubUnitId(subUnit.id);
    setActiveTab('add');
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Sub-Unit Name', flex: 1, minWidth: 200 },
    { field: 'unitName', headerName: 'Unit', flex: 1, minWidth: 200 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row as SubUnit)}
        />,
      ],
    },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, margin: 'auto', maxWidth: 800 }}>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label={isEditing ? 'Edit Sub-Unit' : 'Add New Sub-Unit'} value="add" />
        <Tab label="View Sub-Units" value="view" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 'add' ? (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Sub-Unit Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="unit-label">Unit</InputLabel>
              <Select
                labelId="unit-label"
                name="unitId"
                value={formData.unitId}
                onChange={handleSelectChange}
                label="Unit"
              >
                {units.map(unit => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {isEditing ? (
                <>
                  <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleClear}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" startIcon={<SaveIcon />} type="submit">
                    Update Sub-Unit
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
                    Clear
                  </Button>
                  <Button variant="contained" color="primary" type="submit">
                    Add Sub-Unit
                  </Button>
                </>
              )}
            </Box>
          </form>
        ) : (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box></Box>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search sub-units..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
            </Stack>
            <Box sx={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={filteredSubUnits.map(su => ({
                  ...su,
                  unitName: units.find(u => u.id === su.unitId)?.name || '',
                }))}
                columns={columns}
                loading={loading}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 20]}
                pagination
                disableRowSelectionOnClick
                getRowId={(row) => row.id}
                sx={{
                  '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f5f5' },
                  '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default SubUnitManagementPage;
