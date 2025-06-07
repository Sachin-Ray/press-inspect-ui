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
import { createSeller, fetchAllSellers, updateSellerById } from '../services/api';

interface Seller {
  id: number;
  companyName: string;
  address: string;
}

const SellerManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
  const [formData, setFormData] = useState<Omit<Seller, 'id'>>({
    companyName: '',
    address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentSellerId, setCurrentSellerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ 
    page: 0, 
    pageSize: 5 
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const response = await fetchAllSellers();
      if (Array.isArray(response?.data?.data)) {
        setSellers(response.data.data);
        setFilteredSellers(response.data.data);
      } else {
        setSellers([]);
        setFilteredSellers([]);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setSellers([]);
      setFilteredSellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') {
      fetchSellers();
    }
  }, [activeTab]);

  useEffect(() => {
    const filtered = sellers.filter(seller =>
      seller.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSellers(filtered);
  }, [searchTerm, sellers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClear = () => {
    setFormData({
      companyName: '',
      address: ''
    });
    setIsEditing(false);
    setCurrentSellerId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentSellerId) {
        await updateSellerById(currentSellerId, formData);
      } else {
        await createSeller(formData);
      }

      handleClear();
      if (activeTab === 'view') {
        fetchSellers();
      }
      setActiveTab('view');
    } catch (error) {
      console.error('Error saving seller:', error);
    }
  };

  const handleEdit = (seller: Seller) => {
    setFormData({
      companyName: seller.companyName,
      address: seller.address
    });
    setIsEditing(true);
    setCurrentSellerId(seller.id);
    setActiveTab('add');
  };

  const columns: GridColDef[] = [
    { 
      field: 'companyName', 
      headerName: 'Company Name', 
      flex: 1,
      minWidth: 200
    },
    { 
      field: 'address', 
      headerName: 'Address', 
      flex: 2,
      minWidth: 300
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key={`edit-${params.id}`}
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row as Seller)}
        />,
      ],
    },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, margin: 'auto', maxWidth: 1200 }}>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label={isEditing ? "Edit Seller" : "Add New Seller"} value="add" />
        <Tab label="View Sellers" value="view" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 'add' ? (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              margin="normal"
              required
              multiline
              rows={4}
            />
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
                    Update Seller
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
                    Add Seller
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
              <Box />
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search sellers..."
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
                rows={filteredSellers}
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

export default SellerManagementPage;
