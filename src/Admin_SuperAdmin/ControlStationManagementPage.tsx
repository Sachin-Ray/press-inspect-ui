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
import {
  createControlStation,
  fetchAllControlStation,
  updateControlStationById
} from '../services/api';

interface ControlStation {
  id: number;
  station_name: string;
}

const ControlStationManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  const [stations, setStations] = useState<ControlStation[]>([]);
  const [filteredStations, setFilteredStations] = useState<ControlStation[]>([]);
  const [formData, setFormData] = useState<{ station_name: string }>({ station_name: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentStationId, setCurrentStationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStations = async () => {
    setLoading(true);
    try {
      const response = await fetchAllControlStation();
      const data = (response?.data?.data || []).map((item: any) => ({
        id: item.id,
        station_name: item.station_name
      }));
      setStations(data);
      setFilteredStations(data);
    } catch (error) {
      console.error('Error fetching control stations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') fetchStations();
  }, [activeTab]);

  useEffect(() => {
    const filtered = stations.filter((station) =>
      (station?.station_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStations(filtered);
  }, [searchTerm, stations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClear = () => {
    setFormData({ station_name: '' });
    setIsEditing(false);
    setCurrentStationId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiData = {
      station_name: formData.station_name
    };
    try {
      if (isEditing && currentStationId) {
        await updateControlStationById(currentStationId, apiData);
      } else {
        await createControlStation(apiData);
      }
      handleClear();
      if (activeTab === 'view') fetchStations();
      setActiveTab('view');
    } catch (error) {
      console.error('Error saving control station:', error);
    }
  };

  const handleEdit = (station: ControlStation) => {
    setFormData({ station_name: station.station_name });
    setIsEditing(true);
    setCurrentStationId(station.id);
    setActiveTab('add');
  };

  const columns: GridColDef[] = [
    { field: 'station_name', headerName: 'Control Station Name', flex: 1, minWidth: 200 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row as ControlStation)}
        />
      ]
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, margin: 'auto', maxWidth:1500, marginTop:2}}>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label={isEditing ? 'Edit Control Station' : 'Add New Control Station'} value="add" />
        <Tab label="View Control Stations" value="view" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 'add' ? (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Control Station Name"
              name="station_name"
              value={formData.station_name}
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
                    Update
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
                    Clear
                  </Button>
                  <Button variant="contained" color="primary" type="submit">
                    Add
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
                placeholder="Search control stations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{ width: 300 }}
              />
            </Stack>
            <Box sx={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={filteredStations}
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
                  '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' }
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ControlStationManagementPage;
