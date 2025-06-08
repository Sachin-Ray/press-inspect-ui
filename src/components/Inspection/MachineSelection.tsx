import React, { useState, useEffect } from 'react';
import { useForm } from '../../context/FormContext';
import { fetchAllMachine } from '../../services/api';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from '@mui/x-data-grid';
import { 
  Paper, 
  TextField, 
  InputAdornment, 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';

interface Machine {
  id: number;
  name: string;
  serialNumber: string;
  totalImpressions: string;
  manufacturer: string;
  year: number;
  groupId: number;
  modelId: number;
  sellerId: number;
  buyerId: number;
  createdAt: string;
  updatedAt: string;
}

interface Model {
  id: number;
  name: string;
}

const MachineSelection: React.FC = () => {
  const { formState, setFormState } = useForm();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });

  // Fetch all machines and models on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch machines
        const machinesResponse = await fetchAllMachine();
        const machinesData = Array.isArray(machinesResponse?.data) 
          ? machinesResponse.data 
          : [];
        setMachines(machinesData);
        setFilteredMachines(machinesData);

        // Fetch models
        const modelsResponse = await fetchAllMachine();
        const modelsData = Array.isArray(modelsResponse?.data?.data) 
          ? modelsResponse.data.data 
          : Array.isArray(modelsResponse?.data)
          ? modelsResponse.data
          : [];
        setModels(modelsData);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter machines when search term or model selection changes
  useEffect(() => {
    let filtered = machines;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(machine =>
        machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply model filter if a model is selected
    if (formState.model) {
      filtered = filtered.filter(machine => 
        machine.modelId === Number(formState.model)
      );
    }
    
    setFilteredMachines(filtered);
  }, [searchTerm, machines, formState.model]);

  const handleModelChange = (event: SelectChangeEvent) => {
    setFormState(prev => ({
      ...prev,
      model: event.target.value
    }));
  };

  const handleEdit = (machine: Machine) => {
    // Implement your edit logic here
    console.log('Edit machine:', machine);
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Machine Name', flex: 1, minWidth: 200 },
    { field: 'serialNumber', headerName: 'Serial Number', flex: 1, minWidth: 150 },
    { field: 'manufacturer', headerName: 'Manufacturer', flex: 1, minWidth: 150 },
    { field: 'year', headerName: 'Year', width: 100 },
    { field: 'totalImpressions', headerName: 'Impressions', width: 120 },
    { 
      field: 'modelName', 
      headerName: 'Model', 
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => {
        const model = models.find(m => m.id === params.row.modelId);
        return model ? model.name : 'Unknown';
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row as Machine)}
        />,
      ],
    },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, margin: 'auto', maxWidth: 1200 }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="model-select-label">Filter by Model</InputLabel>
          <Select
            labelId="model-select-label"
            label="Filter by Model"
            value={formState.model || ''}
            onChange={handleModelChange}
          >
            <MenuItem value="">All Models</MenuItem>
            {models.map(model => (
              <MenuItem key={model.id} value={model.id}>
                {model.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search machines..."
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
      </Box>

      <Box sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filteredMachines}
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
    </Paper>
  );
};

export default MachineSelection;