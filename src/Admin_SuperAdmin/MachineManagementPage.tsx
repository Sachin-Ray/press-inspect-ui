import React, { useState, useEffect } from 'react';
import { 
  Tabs, Tab, Button, TextField, Box, Paper,
  InputAdornment, Stack, MenuItem, Select,
  FormControl, InputLabel, CircularProgress
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { SaveIcon } from 'lucide-react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  createMachine, 
  fetchAllBuyers,
  fetchAllGroups,
  fetchAllMachine,
  fetchAllSellers,
  updateMachineById
} from '../services/api';

interface Model {
  id: number;
  name: string;
  serialNumber: string;
  totalImpressions: string;
  manufacturer: string;
  year: number;
  groupId: number;
  buyerId: number;
  sellerId: number;
  groupName?: string;
  buyerName?: string;
  sellerName?: string;
}

interface Group { id: number; name: string; }
interface Buyer { id: number; companyName: string; }
interface Seller { id: number; companyName: string; }

const MachineManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add'|'view'>('add');
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [formData, setFormData] = useState<Omit<Model,'id'>>({
    name: '', serialNumber: '', totalImpressions: '',
    manufacturer: '', year: new Date().getFullYear(),
    groupId: 0, buyerId: 0, sellerId: 0
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentModelId, setCurrentModelId] = useState<number|null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Load dropdowns once
  useEffect(() => {
    const loadDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        const [gRes, bRes, sRes] = await Promise.all([
          fetchAllGroups(), fetchAllBuyers(), fetchAllSellers()
        ]);
        setGroups(gRes.data.data || []);
        setBuyers(bRes.data.data || []);
        setSellers(sRes.data.data || []);
      } catch {
        setGroups([]); setBuyers([]); setSellers([]);
      } finally {
        setLoadingDropdowns(false);
      }
    };
    loadDropdowns();
  }, []);

  // 2. Fetch models whenever user switches to "view" *and* dropdowns are ready
  useEffect(() => {
    if (activeTab !== 'view' || loadingDropdowns) return;
    const loadModels = async () => {
      setLoading(true);
      try {
        const res = await fetchAllMachine();
        // API returns { data: [ ... ] }
        const raw: any[] = res.data.data || [];
        const mapped = raw.map(item => ({
          id: item.id,
          name: item.name,
          serialNumber: item.serialNumber,
          totalImpressions: item.totalImpressions,
          manufacturer: item.manufacturer,
          year: item.year,
          groupId: item.groupId,
          buyerId: item.buyerId,
          sellerId: item.sellerId,
          groupName: groups.find(g => g.id === item.groupId)?.name || '',
          buyerName: buyers.find(b => b.id === item.buyerId)?.companyName || '',
          sellerName: sellers.find(s => s.id === item.sellerId)?.companyName || ''
        })) as Model[];
        setModels(mapped);
        setFilteredModels(mapped);
      } catch {
        setModels([]); setFilteredModels([]);
      } finally {
        setLoading(false);
      }
    };
    loadModels();
  }, [activeTab, loadingDropdowns, groups, buyers, sellers]);

  // 3. Filter on searchTerm
  useEffect(() => {
    setFilteredModels(models.filter(m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    ));
  }, [searchTerm, models]);

  // Handlers…
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleSelectChange = (e: any) => {
    setFormData(f => ({ ...f, [e.target.name]: Number(e.target.value) }));
  };
  const handleClear = () => {
    setFormData({ name:'', serialNumber:'', totalImpressions:'', manufacturer:'', year:new Date().getFullYear(), groupId:0, buyerId:0, sellerId:0 });
    setIsEditing(false);
    setCurrentModelId(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    try {
      if (isEditing && currentModelId) {
        await updateMachineById(currentModelId, payload);
      } else {
        await createMachine(payload);
      }
      handleClear();
      setActiveTab('view');
    } catch (err) {
      console.error(err);
    }
  };
  const handleEdit = (m: Model) => {
    setFormData({
      name: m.name,
      serialNumber: m.serialNumber,
      totalImpressions: m.totalImpressions,
      manufacturer: m.manufacturer,
      year: m.year,
      groupId: m.groupId,
      buyerId: m.buyerId,
      sellerId: m.sellerId
    });
    setCurrentModelId(m.id);
    setIsEditing(true);
    setActiveTab('add');
  };

  // Columns
  const columns: GridColDef[] = [
    { field:'name', headerName:'Name', flex:1, minWidth:150 },
    { field:'serialNumber', headerName:'Serial Number', flex:1, minWidth:150 },
    { field:'manufacturer', headerName:'Manufacturer', flex:1, minWidth:150 },
    { field:'totalImpressions', headerName:'Total Impressions', flex:1, minWidth:150 },
    { field:'year', headerName:'Year', flex:1, minWidth:100 },
    { field:'groupName', headerName:'Group', flex:1, minWidth:150 },
    { field:'buyerName', headerName:'Buyer', flex:1, minWidth:150 },
    { field:'sellerName', headerName:'Seller', flex:1, minWidth:150 },
    {
      field:'actions',
      type:'actions',
      headerName:'Actions',
      width:100,
      getActions: params => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row as Model)}
        />
      ]
    }
  ];

  // Loading dropdowns?
  if (loadingDropdowns) {
    return (
      <Box sx={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center'}}>
        <CircularProgress/>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{p:3, margin:'auto', maxWidth:1400}}>
      <Tabs value={activeTab} onChange={(_,v)=>setActiveTab(v)}>
        <Tab label={isEditing?'Edit Machine':'Add New Machine'} value="add" />
        <Tab label="View Machines" value="view" />
      </Tabs>

      <Box sx={{mt:3}}>
        {activeTab==='add' ? (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField label="Name" name="name" value={formData.name} onChange={handleInputChange} required/>
              <TextField label="Serial Number" name="serialNumber" value={formData.serialNumber} onChange={handleInputChange} required/>
              <TextField label="Total Impressions" name="totalImpressions" value={formData.totalImpressions} onChange={handleInputChange} required/>
              <TextField label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} required/>
              <TextField 
                label="Year" name="year" type="number" 
                value={formData.year} onChange={handleInputChange} required 
                inputProps={{min:1900, max:new Date().getFullYear()}}
              />

              <FormControl fullWidth required>
                <InputLabel>Group</InputLabel>
                <Select name="groupId" value={formData.groupId} onChange={handleSelectChange} label="Group">
                  <MenuItem value={0} disabled>Select Group</MenuItem>
                  {groups.map(g=> <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Buyer</InputLabel>
                <Select name="buyerId" value={formData.buyerId} onChange={handleSelectChange} label="Buyer">
                  <MenuItem value={0} disabled>Select Buyer</MenuItem>
                  {buyers.map(b=> <MenuItem key={b.id} value={b.id}>{b.companyName}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Seller</InputLabel>
                <Select name="sellerId" value={formData.sellerId} onChange={handleSelectChange} label="Seller">
                  <MenuItem value={0} disabled>Select Seller</MenuItem>
                  {sellers.map(s=> <MenuItem key={s.id} value={s.id}>{s.companyName}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>

            <Box sx={{mt:2, display:'flex', justifyContent:'flex-end', gap:1}}>
              {isEditing ? (
                <>
                  <Button variant="outlined" startIcon={<CancelIcon/>} onClick={handleClear}>Cancel</Button>
                  <Button variant="contained" color="primary" startIcon={<SaveIcon/>} type="submit">Update Machine</Button>
                </>
              ) : (
                <>
                  <Button variant="outlined" startIcon={<ClearIcon/>} onClick={handleClear}>Clear</Button>
                  <Button variant="contained" color="primary" type="submit">Add Machine</Button>
                </>
              )}
            </Box>
          </form>
        ) : (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Box/>
              <TextField
                size="small" placeholder="Search machines..."
                value={searchTerm}
                onChange={e=>setSearchTerm(e.target.value)}
                InputProps={{ startAdornment:<InputAdornment position="start"><SearchIcon/></InputAdornment> }}
                sx={{width:300}}
              />
            </Stack>
            <Box sx={{height:500, width:'100%'}}>
              <DataGrid
                rows={filteredModels}
                columns={columns}
                loading={loading}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5,10,20]}
                pagination
                disableRowSelectionOnClick
                getRowId={row=>row.id}
                sx={{
                  '& .MuiDataGrid-columnHeaders':{backgroundColor:'#f5f5f5'},
                  '& .MuiDataGrid-cell':{borderBottom:'1px solid #f0f0f0'}
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
