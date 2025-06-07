import React, { useState, useEffect } from 'react';
import {
  Tabs,
  Tab,
  Button,
  TextField,
  Box,
  Paper,
  InputAdornment,
  Stack
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { SaveIcon } from 'lucide-react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { createUnit, fetchAllUnits, updateUnitById } from '../services/api';

interface Unit {
  id: number;
  name: string;
}

const UnitManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  const [units, setUnits] = useState<Unit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [formData, setFormData] = useState<{ name: string }>({ name: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentUnitId, setCurrentUnitId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await fetchAllUnits();
      const data = response?.data?.data || [];
      setUnits(data);
      setFilteredUnits(data);
    } catch (error) {
      console.error('Error fetching units:', error);
      setUnits([]);
      setFilteredUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') fetchUnits();
  }, [activeTab]);

  useEffect(() => {
    const filtered = units.filter(unit =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUnits(filtered);
  }, [searchTerm, units]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ name: e.target.value });
  };

  const handleClear = () => {
    setFormData({ name: '' });
    setIsEditing(false);
    setCurrentUnitId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentUnitId) {
        await updateUnitById(currentUnitId, formData);
      } else {
        await createUnit(formData);
      }
      handleClear();
      if (activeTab === 'view') fetchUnits();
      setActiveTab('view');
    } catch (error) {
      console.error('Error saving unit:', error);
    }
  };

  const handleEdit = (unit: Unit) => {
    setFormData({ name: unit.name });
    setIsEditing(true);
    setCurrentUnitId(unit.id);
    setActiveTab('add');
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Unit Name', flex: 1, minWidth: 200 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row as Unit)}
        />,
      ],
    },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, margin: 'auto', maxWidth: 800 }}>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label={isEditing ? 'Edit Unit' : 'Add New Unit'} value="add" />
        <Tab label="View Units" value="view" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 'add' ? (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Unit Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {isEditing ? (
                <>
                  <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleClear}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" startIcon={<SaveIcon />} type="submit">
                    Update Unit
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
                    Clear
                  </Button>
                  <Button variant="contained" color="primary" type="submit">
                    Add Unit
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
                placeholder="Search units..."
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
                rows={filteredUnits}
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

export default UnitManagementPage;
