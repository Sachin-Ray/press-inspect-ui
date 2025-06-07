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
  InputLabel,
  CircularProgress
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { SaveIcon } from 'lucide-react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { createMachine, fetchAllBuyers, fetchAllGroups, fetchAllMachine, fetchAllSellers, updateMachineById } from '../services/api';

interface Model {
  id: number;
  name: string;
  serialNumber: string;
  totalImpressions: string;
  manufacturer: string;
  year: number;
  groupId: number;
  sellerId: number;
  buyerId: number;
  groupName?: string;
  buyerName?: string;
  sellerName?: string;
}

interface Group {
  id: number;
  name: string;
}

interface Buyer {
  id: number;
  companyName: string;
}

interface Seller {
  id: number;
  companyName: string;
}

const MachineManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [formData, setFormData] = useState<Omit<Model, 'id'>>({
    name: '',
    serialNumber: '',
    totalImpressions: '',
    manufacturer: '',
    year: new Date().getFullYear(),
    groupId: 0,
    buyerId: 0,
    sellerId: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentModelId, setCurrentModelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ 
    page: 0, 
    pageSize: 5 
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await fetchAllMachine();
      const modelsWithNames = response.data.map((model: Model) => ({
        ...model,
        groupName: groups.find(g => g.id === model.groupId)?.name || '',
        buyerName: buyers.find(b => b.id === model.buyerId)?.companyName || '',
        sellerName: sellers.find(s => s.id === model.sellerId)?.companyName || ''
      }));
      setModels(modelsWithNames);
      setFilteredModels(modelsWithNames);
    } catch (error) {
      console.error('Error fetching models:', error);
      setModels([]);
      setFilteredModels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [groupsRes, buyersRes, sellersRes] = await Promise.all([
        fetchAllGroups(),
        fetchAllBuyers(),
        fetchAllSellers()
      ]);
      
      setGroups(groupsRes.data.data || []);
      setBuyers(buyersRes.data.data || []);
      setSellers(sellersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setGroups([]);
      setBuyers([]);
      setSellers([]);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') {
      fetchModels();
    }
  }, [activeTab]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const filtered = models.filter(model =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredModels(filtered);
  }, [searchTerm, models]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClear = () => {
    setFormData({
      name: '',
      serialNumber: '',
      totalImpressions: '',
      manufacturer: '',
      year: new Date().getFullYear(),
      groupId: 0,
      buyerId: 0,
      sellerId: 0
    });
    setIsEditing(false);
    setCurrentModelId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        serialNumber: formData.serialNumber,
        totalImpressions: formData.totalImpressions,
        manufacturer: formData.manufacturer,
        year: formData.year,
        groupId: formData.groupId,
        buyerId: formData.buyerId,
        sellerId: formData.sellerId
      };

      if (isEditing && currentModelId) {
        await updateMachineById(currentModelId, payload);
      } else {
        await createMachine(payload);
      }

      handleClear();
      if (activeTab === 'view') {
        fetchModels();
      }
      setActiveTab('view');
    } catch (error) {
      console.error('Error saving model:', error);
    }
  };

  const handleEdit = (model: Model) => {
    setFormData({
      name: model.name,
      serialNumber: model.serialNumber,
      totalImpressions: model.totalImpressions,
      manufacturer: model.manufacturer,
      year: model.year,
      groupId: model.groupId,
      buyerId: model.buyerId,
      sellerId: model.sellerId
    });
    setIsEditing(true);
    setCurrentModelId(model.id);
    setActiveTab('add');
  };

  const columns: GridColDef[] = [
    { 
      field: 'name', 
      headerName: 'Name', 
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'serialNumber', 
      headerName: 'Serial Number', 
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'manufacturer', 
      headerName: 'Manufacturer', 
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'totalImpressions', 
      headerName: 'Total Impressions', 
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'year', 
      headerName: 'Year', 
      flex: 1,
      minWidth: 100
    },
    { 
      field: 'groupName', 
      headerName: 'Group', 
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'buyerName', 
      headerName: 'Buyer', 
      flex: 1,
      minWidth: 150
    },
    { 
      field: 'sellerName', 
      headerName: 'Seller', 
      flex: 1,
      minWidth: 150
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
          onClick={() => handleEdit(params.row as Model)}
        />,
      ],
    },
  ];

  if (loadingDropdowns) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, margin: 'auto', maxWidth: 1400 }}>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label={isEditing ? "Edit Machine" : "Add New Machine"} value="add" />
        <Tab label="View Machines" value="view" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 'add' ? (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                label="Serial Number"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                label="Total Impressions"
                name="totalImpressions"
                value={formData.totalImpressions}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                label="Manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleInputChange}
                required
              />
              <TextField
                fullWidth
                label="Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                required
                inputProps={{
                  min: 1900,
                  max: new Date().getFullYear()
                }}
              />
              
              <FormControl fullWidth required>
                <InputLabel>Group</InputLabel>
                <Select
                  name="groupId"
                  value={formData.groupId}
                  onChange={handleSelectChange}
                  label="Group"
                >
                  <MenuItem value={0} disabled>Select Group</MenuItem>
                  {groups?.map(group => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Buyer</InputLabel>
                <Select
                  name="buyerId"
                  value={formData.buyerId}
                  onChange={handleSelectChange}
                  label="Buyer"
                >
                  <MenuItem value={0} disabled>Select Buyer</MenuItem>
                  {buyers?.map(buyer => (
                    <MenuItem key={buyer.id} value={buyer.id}>
                      {buyer.companyName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Seller</InputLabel>
                <Select
                  name="sellerId"
                  value={formData.sellerId}
                  onChange={handleSelectChange}
                  label="Seller"
                >
                  <MenuItem value={0} disabled>Select Seller</MenuItem>
                  {sellers?.map(seller => (
                    <MenuItem key={seller.id} value={seller.id}>
                      {seller.companyName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {isEditing ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleClear}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    type="submit"
                  >
                    Update Machine
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                  >
                    Add Machine
                  </Button>
                </>
              )}
            </Box>
          </form>
        ) : (
          <>
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center" 
              mb={2}
            >
              <Box>
                {/* Pagination controls will appear here automatically */}
              </Box>
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
            </Stack>
            <Box sx={{ height: 500, width: '100%' }}>
              <DataGrid
                rows={filteredModels}
                columns={columns}
                loading={loading}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 20]}
                pagination
                disableRowSelectionOnClick
                getRowId={(row) => row.id}
                sx={{
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f5f5f5',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0',
                  },
                }}
                slots={{
                  toolbar: () => null,
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default MachineManagementPage;