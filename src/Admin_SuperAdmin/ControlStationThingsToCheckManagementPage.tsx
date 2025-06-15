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
  FormControl,
  InputLabel
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { SaveIcon } from 'lucide-react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  createControlStationThingsToCheck,
  fetchAllControlStationThingsToCheck,
  updateControlStationThingsToCheckById,
  fetchAllControlStation
} from '../services/api';

interface ControlStation {
  id: number;
  stationName: string;
}

interface ControlStationThingsToCheck {
  id: number;
  thingsToCheck: string;
  controlStationId: number;
  controlStationName?: string;
}

const ControlStationThingsToCheckManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  const [items, setItems] = useState<ControlStationThingsToCheck[]>([]);
  const [filteredItems, setFilteredItems] = useState<ControlStationThingsToCheck[]>([]);
  const [controlStations, setControlStations] = useState<ControlStation[]>([]);
  const [formData, setFormData] = useState<{
    thingsToCheck: string;
    controlStationId: number | '';
  }>({ 
    thingsToCheck: '',
    controlStationId: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch control stations when component mounts
  useEffect(() => {
    const fetchControlStations = async () => {
      try {
        const stationsResponse = await fetchAllControlStation();
        const stationsData = (stationsResponse?.data?.data || []).map((item: any) => ({
          id: item.id,
          stationName: item.stationName
        }));
        setControlStations(stationsData);
      } catch (error) {
        console.error('Error fetching control stations:', error);
      }
    };

    fetchControlStations();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetchAllControlStationThingsToCheck();
      
      const data = (response?.data?.data || []).map((item: any) => ({
        id: item.id,
        thingsToCheck: item.thingsToCheck,
        controlStationId: item.controlStationId,
        controlStationName: controlStations.find((s: ControlStation) => s.id === item.controlStationId)?.stationName || 'Unknown'
      }));
      
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      console.error('Error fetching control station things to check:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') {
      fetchItems();
    }
  }, [activeTab]);

  useEffect(() => {
    const filtered = items.filter((item) =>
      (item?.thingsToCheck || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item?.controlStationName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClear = () => {
    setFormData({ 
      thingsToCheck: '',
      controlStationId: ''
    });
    setIsEditing(false);
    setCurrentItemId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.controlStationId === '') {
      alert('Please select a control station');
      return;
    }
    
    const apiData = {
      thingsToCheck: formData.thingsToCheck,
      controlStationId: formData.controlStationId as number
    };
    
    try {
      if (isEditing && currentItemId) {
        await updateControlStationThingsToCheckById(currentItemId, apiData);
      } else {
        await createControlStationThingsToCheck(apiData);
      }
      handleClear();
      if (activeTab === 'view') fetchItems();
      setActiveTab('view');
    } catch (error) {
      console.error('Error saving control station things to check:', error);
    }
  };

  const handleEdit = (item: ControlStationThingsToCheck) => {
    setFormData({ 
      thingsToCheck: item.thingsToCheck,
      controlStationId: item.controlStationId
    });
    setIsEditing(true);
    setCurrentItemId(item.id);
    setActiveTab('add');
  };

  const columns: GridColDef[] = [
    { field: 'thingsToCheck', headerName: 'Things To Check', flex: 1, minWidth: 200 },
    { 
      field: 'controlStationName', 
      headerName: 'Control Station', 
      flex: 1, 
      minWidth: 200,
      valueGetter: (params) => params.row.controlStationName || 'Unknown'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row as ControlStationThingsToCheck)}
        />
      ]
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, margin: 'auto', maxWidth: 1500, marginTop: 2 }}>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label={isEditing ? 'Edit Things To Check' : 'Add New Things To Check'} value="add" />
        <Tab label="View Things To Check" value="view" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 'add' ? (
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="control-station-label">Control Station</InputLabel>
              <Select
                labelId="control-station-label"
                id="controlStationId"
                name="controlStationId"
                value={formData.controlStationId}
                label="Control Station"
                onChange={handleSelectChange}
              >
                {controlStations.map((station) => (
                  <MenuItem key={station.id} value={station.id}>
                    {station.stationName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Things To Check"
              name="thingsToCheck"
              value={formData.thingsToCheck}
              onChange={handleInputChange}
              margin="normal"
              required
              multiline
              rows={4}
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
                placeholder="Search things to check..."
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
                rows={filteredItems}
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

export default ControlStationThingsToCheckManagementPage;