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
import { createBuyer, fetchAllBuyers, updateBuyerById } from '../services/api';

interface Buyer {
  id: number;
  company_name: string;
  address: string;
}

const BuyerManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [filteredBuyers, setFilteredBuyers] = useState<Buyer[]>([]);
  const [formData, setFormData] = useState<Omit<Buyer, 'id'>>({
    company_name: '',
    address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentBuyerId, setCurrentBuyerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ 
    page: 0, 
    pageSize: 5 
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const response = await fetchAllBuyers();
      console.log("Fetched buyers:", response.data);

      if (Array.isArray(response?.data?.data)) {
        setBuyers(response.data.data);
        setFilteredBuyers(response.data.data);
      } else {
        console.error('Expected buyers array is missing in response:', response.data);
        setBuyers([]);
        setFilteredBuyers([]);
      }
    } catch (error) {
      console.error('Error fetching buyers:', error);
      setBuyers([]);
      setFilteredBuyers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') {
      fetchBuyers();
    }
  }, [activeTab]);

  useEffect(() => {
    const filtered = buyers.filter(buyer =>
      buyer.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBuyers(filtered);
  }, [searchTerm, buyers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClear = () => {
    setFormData({
      company_name: '',
      address: ''
    });
    setIsEditing(false);
    setCurrentBuyerId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && currentBuyerId) {
        await updateBuyerById(currentBuyerId, formData);
      } else {
        await createBuyer(formData);
      }

      handleClear();
      if (activeTab === 'view') {
        fetchBuyers();
      }
      setActiveTab('view');
    } catch (error) {
      console.error('Error saving buyer:', error);
    }
  };

  const handleEdit = (buyer: Buyer) => {
    setFormData({
      company_name: buyer.company_name,
      address: buyer.address
    });
    setIsEditing(true);
    setCurrentBuyerId(buyer.id);
    setActiveTab('add');
  };

  const columns: GridColDef[] = [
    { 
      field: 'company_name', 
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
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row as Buyer)}
        />,
      ],
    },
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, margin: 'auto', maxWidth:1500, marginTop:2}}>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label={isEditing ? "Edit Buyer" : "Add New Buyer"} value="add" />
        <Tab label="View Buyers" value="view" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 'add' ? (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Company Name"
              name="company_name"
              value={formData.company_name}
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
                    Update Buyer
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
                    Add Buyer
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
                placeholder="Search buyers..."
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
                rows={filteredBuyers}
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
                  toolbar: () => null, // Hide default toolbar to customize our own
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default BuyerManagementPage;