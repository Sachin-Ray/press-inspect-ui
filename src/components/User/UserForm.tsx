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
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Switch,
  Modal
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { SaveIcon, Eye, Download } from 'lucide-react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
  getRoles,
  registerUser,
  getUsers,
  getCountries,
  updateUserStatus
} from '../../services/api';

interface Role {
  id: number;
  name: string;
}

interface Country {
  code: string;
  id: number;
  name: string;
}

interface UserType {
  id: number;
  first_name: string;
  last_name: string;
  passport_number: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  countryId: number;
  country: {
    id: number;
    name: string;
  };
  company_name: string | null;
  registration_id: string | null;
  cv_url: string | null;
  work_experience: string | null;
  is_active: boolean;
  roles: Role[];
  mobile: string;
  passport_expiry_date: string;
  passport_attachment: string | null;
  joining_date: string;
  photo_of_engineer: string | null;
}

const UserManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [fileUploads, setFileUploads] = useState({
    cvFile: null as File | null,
    passportFile: null as File | null,
    photoFile: null as File | null
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    passportNumber: '',
    email: '',
    password: '',
    roleId: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    countryId: '',
    mobile: '',
    companyName: '',
    registrationId: '',
    cvUrl: '',
    workExperience: '',
    passportExpiryDate: '',
    passportAttachment: '',
    photoOfEngineer: '',
    joiningDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchInitialData();
    if (activeTab === 'view') fetchUsers();
  }, [activeTab]);

  const fetchInitialData = async () => {
    try {
      const [rolesRes, countriesRes] = await Promise.all([getRoles(), getCountries()]);
      setRoles(rolesRes.data.data);
      setCountries(countriesRes.data.data);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      setUsers(response.data.data);
      setFilteredUsers(response.data.data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = users.filter(user =>
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'passport' | 'photo') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileUrl = URL.createObjectURL(file);

      setFileUploads(prev => ({
        ...prev,
        [`${type}File`]: file
      }));

      setFormData(prev => ({
        ...prev,
        [`${type}Url`]: fileUrl,
        ...(type === 'passport' ? { passportAttachment: fileUrl } : {}),
        ...(type === 'photo' ? { photoOfEngineer: fileUrl } : {})
      }));
    }
  };

  const handleClear = () => {
    setFormData({
      firstName: '',
      lastName: '',
      passportNumber: '',
      email: '',
      password: '',
      roleId: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      countryId: '',
      mobile: '',
      companyName: '',
      registrationId: '',
      cvUrl: '',
      workExperience: '',
      passportExpiryDate: '',
      passportAttachment: '',
      photoOfEngineer: '',
      joiningDate: '',
      isActive: true
    });
    setFileUploads({
      cvFile: null,
      passportFile: null,
      photoFile: null
    });
    setIsEditing(false);
    setCurrentUserId(null);
  };

  const validatePassword = (password: string) => {
    if (isEditing && !password) return true;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validatePassword(formData.password)) {
      alert('Password must contain at least one uppercase, one lowercase, one number, and one special character (8 chars min)');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        roleId: parseInt(formData.roleId, 10),
        passportNumber: formData.passportNumber,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        countryId: parseInt(formData.countryId, 10),
        companyName: formData.companyName,
        registrationId: formData.registrationId,
        cvUrl: formData.cvUrl,
        workExperience: formData.workExperience,
        passportExpiryDate: formData.passportExpiryDate,
        passportAttachment: formData.passportAttachment,
        photoOfEngineer: formData.photoOfEngineer,
        joiningDate: formData.joiningDate ? new Date(formData.joiningDate).toISOString() : null,
        is_active: formData.isActive
      };

      if (isEditing && currentUserId) {
        // await updateUser(currentUserId, payload);
      } else {
        await registerUser(payload);
      }

      handleClear();
      fetchUsers();
      setActiveTab('view');
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserType) => {
    setFormData({
      firstName: user.first_name,
      lastName: user.last_name,
      passportNumber: user.passport_number,
      email: user.email,
      password: '',
      roleId: user.roles[0]?.id.toString() || '',
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      countryId: user.countryId.toString(),
      mobile: user.mobile,
      companyName: user.company_name || '',
      registrationId: user.registration_id || '',
      cvUrl: user.cv_url || '',
      workExperience: user.work_experience || '',
      passportExpiryDate: user.passport_expiry_date || '',
      passportAttachment: user.passport_attachment || '',
      photoOfEngineer: user.photo_of_engineer || '',
      joiningDate: user.joining_date ? user.joining_date.split('T')[0] : '',
      isActive: user.is_active
    });
    setIsEditing(true);
    setCurrentUserId(user.id);
    setActiveTab('add');
  };

  const handleView = (user: UserType) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  const handleStatusChange = async (userId: number, newStatus: boolean) => {
    try {
      await updateUserStatus(userId, newStatus);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      valueGetter: (params) => `${params.row.first_name} ${params.row.last_name}`
    },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      valueGetter: (params) => params.row.roles.map((r: Role) => r.name).join(', ')
    },
    {
      field: 'isActive',
      headerName: 'Active Status',
      width: 180,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Switch
            checked={params.row.is_active}
            onChange={(e) => handleStatusChange(params.row.id, e.target.checked)}
            color="success"
          />
          <span>{params.row.is_active ? 'Active' : 'Inactive'}</span>
        </Box>
      ),
      sortable: false,
      filterable: false
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row as UserType)}
        />,
        <GridActionsCellItem
          icon={<Eye size={20} />}
          label="View"
          onClick={() => handleView(params.row as UserType)}
        />
      ]
    }
  ];

  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    maxWidth: '800px',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2
  };

  return (
    <Paper elevation={3} sx={{ p: 3, margin: 'auto', maxWidth: 1200 }}>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label={isEditing ? 'Edit User' : 'Add New User'} value="add" />
        <Tab label="View Users" value="view" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 'add' ? (
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Passport Number"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label={isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required={!isEditing}
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="roleId"
                  value={formData.roleId}
                  onChange={handleSelectChange}
                  label="Role"
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Country</InputLabel>
                <Select
                  name="countryId"
                  value={formData.countryId}
                  onChange={handleSelectChange}
                  label="Country"
                >
                  {countries.map(country => (
                    <MenuItem key={country.id} value={country.id}>
                      {country.code} - {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Registration ID"
                name="registrationId"
                value={formData.registrationId}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Work Experience"
                name="workExperience"
                value={formData.workExperience}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Passport Expiry Date"
                name="passportExpiryDate"
                type="date"
                value={formData.passportExpiryDate}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Joining Date"
                name="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              {/* File Upload Fields */}
              <Box>
                <InputLabel>CV (PDF)</InputLabel>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'cv')}
                />
                {formData.cvUrl && (
                  <Button
                    startIcon={<Download />}
                    onClick={() => window.open(formData.cvUrl, '_blank')}
                  >
                    View Current CV
                  </Button>
                )}
              </Box>

              <Box>
                <InputLabel>Passport Attachment</InputLabel>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'passport')}
                />
                {formData.passportAttachment && (
                  <Button
                    startIcon={<Download />}
                    onClick={() => window.open(formData.passportAttachment, '_blank')}
                  >
                    View Current Passport
                  </Button>
                )}
              </Box>

              <Box>
                <InputLabel>Engineer Photo</InputLabel>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'photo')}
                />
                {formData.photoOfEngineer && (
                  <Button
                    startIcon={<Download />}
                    onClick={() => window.open(formData.photoOfEngineer, '_blank')}
                  >
                    View Current Photo
                  </Button>
                )}
              </Box>
            </Box>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {isEditing ? (
                <>
                  <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleClear}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" startIcon={<SaveIcon />} type="submit" disabled={loading}>
                    Update User
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
                    Clear
                  </Button>
                  <Button variant="contained" color="primary" type="submit" disabled={loading}>
                    Add User
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
                placeholder="Search users..."
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
                rows={filteredUsers}
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

      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)}>
        <Box sx={modalStyle}>
          {selectedUser && (
            <>
              <Box  sx={{ display: 'flex', justifyContent: 'space-between',fontWeight: 'bold', alignItems: 'center', mb: 2,fontSize: '1.5rem' }}>
                <h2>{selectedUser.first_name} {selectedUser.last_name}</h2>
                <Button onClick={() => setViewModalOpen(false)}><CancelIcon /></Button>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                    <Box
                      component="h4"
                      sx={{
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        margin: 0,
                        fontSize: '1.08rem'
                      }}
                    >
                      Personal Information
                    </Box>
                  </Box>

                  <p><Box
                    sx={{
                      fontWeight: 'bold'
                    }}>Email:</Box> {selectedUser.email}</p>
                  <p><Box
                    sx={{
                      fontWeight: 'bold'
                    }}>Mobile:</Box> {selectedUser.mobile}</p>
                  <p><Box
                    sx={{
                      fontWeight: 'bold'
                    }}>Passport:</Box> {selectedUser.passport_number ?? 'For Now No Passport'}</p>
                  <p><Box
                    sx={{
                      fontWeight: 'bold'
                    }}>Address: </Box>{selectedUser.address}</p>
                  <p><Box
                    sx={{
                      fontWeight: 'bold'
                    }}>City:</Box> {selectedUser.city}</p>
                  <p><Box
                    sx={{
                      fontWeight: 'bold'
                    }}>State:</Box> {selectedUser.state}</p>
                  <p><Box
                    sx={{
                      fontWeight: 'bold'
                    }}>Pincode:</Box> {selectedUser.pincode}</p>
                  <p><Box
                    sx={{
                      fontWeight: 'bold'
                    }}>Country:</Box> {selectedUser.country?.name}</p>
                </Box>

                <Box>
                  <h3>Professional Information</h3>
                  <p>Role: {selectedUser.roles.map(r => r.name).join(', ')}</p>
                  <p>Company: {selectedUser.company_name}</p>
                  <p>Registration ID: {selectedUser.registration_id}</p>
                  <p>Work Experience: {selectedUser.work_experience}</p>
                  <p>Passport Expiry: {selectedUser.passport_expiry_date}</p>
                  <p>Status: {selectedUser.is_active ? 'Active' : 'Inactive'}</p>

                  <h3>Documents</h3>
                  {selectedUser.cv_url && (
                    <Button
                      startIcon={<Download />}
                      onClick={() => window.open(selectedUser.cv_url || '', '_blank')}
                    >
                      Download CV
                    </Button>
                  )}
                  {selectedUser.passport_attachment && (
                    <Button
                      startIcon={<Download />}
                      onClick={() => window.open(selectedUser.passport_attachment || '', '_blank')}
                    >
                      Download Passport
                    </Button>
                  )}
                  {selectedUser.photo_of_engineer && (
                    <Button
                      startIcon={<Download />}
                      onClick={() => window.open(selectedUser.photo_of_engineer || '', '_blank')}
                    >
                      Download Photo
                    </Button>
                  )}
                </Box>
              </Box>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setViewModalOpen(false);
                    handleEdit(selectedUser);
                  }}
                >
                  Edit User
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Paper>
  );
};

export default UserManagementPage;