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
  serial_number: string;
  total_impressions: string;
  manufacturer: string;
  year: number;
  group_id: number;
  buyer_id: number;
  seller_id: number;
  groupName?: string;
  buyerName?: string;
  sellerName?: string;
}

interface Group { id: number; name: string; }
interface Buyer { id: number; company_name: string; }
interface Seller { id: number; company_name: string; }

const MachineManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add'|'view'>('add');
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [formData, setFormData] = useState<Omit<Model,'id'>>({
    name: '', serial_number: '', total_impressions: '',
    manufacturer: '', year: new Date().getFullYear(),
    group_id: 0, buyer_id: 0, seller_id: 0
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
          serial_number: item.serial_number,
          total_impressions: item.total_impressions,
          manufacturer: item.manufacturer,
          year: item.year,
          group_id: item.group_id,
          buyer_id: item.buyer_id,
          seller_id: item.seller_id,
          groupName: groups.find(g => g.id === item.group_id)?.name || '',
          buyerName: buyers.find(b => b.id === item.buyer_id)?.company_name || '',
          sellerName: sellers.find(s => s.id === item.seller_id)?.company_name || ''
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
      m.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    setFormData({ name:'', serial_number:'', total_impressions:'', manufacturer:'', year:new Date().getFullYear(), group_id:0, buyer_id:0, seller_id:0 });
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
      serial_number: m.serial_number,
      total_impressions: m.total_impressions,
      manufacturer: m.manufacturer,
      year: m.year,
      group_id: m.group_id,
      buyer_id: m.buyer_id,
      seller_id: m.seller_id
    });
    setCurrentModelId(m.id);
    setIsEditing(true);
    setActiveTab('add');
  };

  // Columns
  const columns: GridColDef[] = [
    { field:'name', headerName:'Name', flex:1, minWidth:150 },
    { field:'serial_number', headerName:'Serial Number', flex:1, minWidth:150 },
    { field:'manufacturer', headerName:'Manufacturer', flex:1, minWidth:150 },
    { field:'total_impressions', headerName:'Total Impressions', flex:1, minWidth:150 },
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
    <Paper elevation={3} sx={{p:3, margin:'auto', maxWidth:1500, marginTop:2}}>
      <Tabs value={activeTab} onChange={(_,v)=>setActiveTab(v)}>
        <Tab label={isEditing?'Edit Machine':'Add New Machine'} value="add" />
        <Tab label="View Machines" value="view" />
      </Tabs>

      <Box sx={{mt:3}}>
        {activeTab==='add' ? (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField label="Name" name="name" value={formData.name} onChange={handleInputChange} required/>
              <TextField label="Serial Number" name="serial_number" value={formData.serial_number} onChange={handleInputChange} required/>
              <TextField label="Total Impressions" name="total_impressions" value={formData.total_impressions} onChange={handleInputChange} required/>
              <TextField label="Manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleInputChange} required/>
              <TextField 
                label="Year" name="year" type="number" 
                value={formData.year} onChange={handleInputChange} required 
                inputProps={{min:1900, max:new Date().getFullYear()}}
              />

              <FormControl fullWidth required>
                <InputLabel>Group</InputLabel>
                <Select name="group_id" value={formData.group_id} onChange={handleSelectChange} label="Group">
                  <MenuItem value={0} disabled>Select Group</MenuItem>
                  {groups.map(g=> <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Buyer</InputLabel>
                <Select name="buyer_id" value={formData.buyer_id} onChange={handleSelectChange} label="Buyer">
                  <MenuItem value={0} disabled>Select Buyer</MenuItem>
                  {buyers.map(b=> <MenuItem key={b.id} value={b.id}>{b.company_name}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Seller</InputLabel>
                <Select name="seller_id" value={formData.seller_id} onChange={handleSelectChange} label="Seller">
                  <MenuItem value={0} disabled>Select Seller</MenuItem>
                  {sellers.map(s=> <MenuItem key={s.id} value={s.id}>{s.company_name}</MenuItem>)}
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
