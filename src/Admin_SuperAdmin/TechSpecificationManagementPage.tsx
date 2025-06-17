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
  Typography,
  Link
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { SaveIcon } from 'lucide-react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  createTechSpecification,
  fetchAllTechSpecifications,
  updateTechSpecificationById,
  fetchAllMachine
} from '../services/api';

interface TechSpecification {
  id: number;
  model_id: number;
  date_of_upload: string;
  pdf: string;
  file_name: string | null;
  model_name?: string;
  model_serial?: string;
}

interface Model {
  id: number;
  name: string;
  serial_number: string;
}

const TechSpecificationManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  const [specs, setSpecs] = useState<TechSpecification[]>([]);
  const [filteredSpecs, setFilteredSpecs] = useState<TechSpecification[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [formData, setFormData] = useState<{
    model_id: number | '';
    techSpecFile: File | null;
  }>({ model_id: '', techSpecFile: null });
  const [isEditing, setIsEditing] = useState(false);
  const [currentSpecId, setCurrentSpecId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTechSpecifications = async () => {
    setLoading(true);
    try {
      const response = await fetchAllTechSpecifications();
      const data = response?.data?.data || [];
      // Enhance data with model names for display
      const enhancedData = data.map((spec: { model_id: number; }) => ({
        ...spec,
        model_name: models.find(m => m.id === spec.model_id)?.name || 'Unknown',
        model_serial: models.find(m => m.id === spec.model_id)?.serial_number || 'Unknown'
      }));
      setSpecs(enhancedData);
      setFilteredSpecs(enhancedData);
    } catch (error) {
      console.error('Error fetching tech specifications:', error);
      setSpecs([]);
      setFilteredSpecs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetchAllMachine();
      const data = response?.data?.data || [];
      setModels(data);
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') {
      fetchTechSpecifications();
    } else {
      fetchModels();
    }
  }, [activeTab]);

  useEffect(() => {
    const filtered = specs.filter(spec =>
      (spec.model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      spec.model_serial?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSpecs(filtered);
  }, [searchTerm, specs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, techSpecFile: e.target.files![0] }));
    }
  };

  const handleClear = () => {
    setFormData({ model_id: '', techSpecFile: null });
    setIsEditing(false);
    setCurrentSpecId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.model_id || !formData.techSpecFile) {
      alert('Please select a model and upload a file');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('model_id', formData.model_id.toString());
      formDataToSend.append('techSpecFile', formData.techSpecFile);

      if (isEditing && currentSpecId) {
        await updateTechSpecificationById(currentSpecId, formDataToSend);
      } else {
        await createTechSpecification(formDataToSend);
      }
      handleClear();
      if (activeTab === 'view') fetchTechSpecifications();
      setActiveTab('view');
    } catch (error) {
      console.error('Error saving tech specification:', error);
    }
  };

  const handleEdit = (spec: TechSpecification) => {
    setFormData({
      model_id: spec.model_id,
      techSpecFile: null // Need to handle file differently for edit
    });
    setIsEditing(true);
    setCurrentSpecId(spec.id);
    setActiveTab('add');
  };

  const columns: GridColDef[] = [
    { 
      field: 'model_name', 
      headerName: 'Model Name', 
      flex: 1, 
      minWidth: 200,
      valueGetter: (params) => `${params.row.model_name} - ${params.row.model_serial}`
    },
    { 
      field: 'date_of_upload', 
      headerName: 'Upload Date', 
      width: 200,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    { 
      field: 'pdf', 
      headerName: 'File', 
      width: 200,
      renderCell: (params) => (
        <Link href={params.value} target="_blank" rel="noopener">
          View PDF
        </Link>
      )
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
          onClick={() => handleEdit(params.row as TechSpecification)}
        />,
      ],
    },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, margin: 'auto', maxWidth: 1500, marginTop: 2 }}>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label={isEditing ? 'Edit Tech Specification' : 'Add New Tech Specification'} value="add" />
        <Tab label="View Tech Specifications" value="view" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 'add' ? (
          <form onSubmit={handleSubmit}>
            <TextField
              select
              fullWidth
              label="Machine Model"
              name="model_id"
              value={formData.model_id}
              onChange={handleInputChange}
              margin="normal"
              required
            >
              <MenuItem value="">Select a model</MenuItem>
              {models.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.name} - {model.serial_number}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {isEditing ? 'Upload new tech specification file (leave empty to keep current file)' : 'Tech Specification File'}
              </Typography>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                required={!isEditing}
              />
              {formData.techSpecFile && (
                <Typography variant="body2">
                  Selected file: {formData.techSpecFile.name}
                </Typography>
              )}
            </Box>

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
                    Upload
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
                placeholder="Search tech specs..."
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
                rows={filteredSpecs}
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

export default TechSpecificationManagementPage;