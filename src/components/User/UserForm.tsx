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
  Modal,
  IconButton,
  Typography
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
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
  updateUserStatus,
  downloadCv,
  downloadPhoto,
  downloadPassport,
  updateUserById
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
  country_id: number;
  country: {
    id: number;
    name: string;
  };
  company_name: string | null;
  registration_id: string | null;
  cv: string | null;
  work_experience: string | null;
  is_active: boolean;
  roles: Role[];
  mobile: string;
  passport_expiry_date: string;
  passportAttachment: string | null;
  joining_date: string;
  photoOfEngineer: string | null;
}

interface FileUploads {
  cv: File | null;
  passportAttachment: File | null;
  photoOfEngineer: File | null;
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
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fileUploads, setFileUploads] = useState<FileUploads>({
    cv: null,
    passportAttachment: null,
    photoOfEngineer: null
  });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    passport_number: '',
    email: '',
    password: '',
    role_id: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country_id: '',
    mobile: '',
    company_name: '',
    registration_id: '',
    work_experience: '',
    passport_expiry_date: '',
    joining_date: ''
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
      console.log(`File selected (${type}):`, file.name, file.size, file.type);

      try {
        validateFile(file, type);

        setFileUploads(prev => ({
          ...prev,
          [type === 'cv' ? 'cv' :
            type === 'passport' ? 'passportAttachment' :
              'photoOfEngineer']: file
        }));
      } catch (error) {
        alert(error);
        console.error(`File validation error (${type}):`, error);
        e.target.value = ''; // Reset file input
      }
    }
  };

  const validateFile = (file: File, type: 'cv' | 'passport' | 'photo') => {
    const validTypes = {
      cv: ['application/pdf'],
      passport: ['application/pdf', 'image/jpeg', 'image/png'],
      photo: ['image/jpeg', 'image/png']
    };

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes[type].includes(file.type)) {
      throw new Error(`Invalid file type for ${type}. Allowed: ${validTypes[type].join(', ')}`);
    }

    if (file.size > maxSize) {
      throw new Error('File size exceeds 5MB limit');
    }
  };

  const handleClear = () => {
    setFormData({
      first_name: '',
      last_name: '',
      passport_number: '',
      email: '',
      password: '',
      role_id: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country_id: '',
      mobile: '',
      company_name: '',
      registration_id: '',
      work_experience: '',
      passport_expiry_date: '',
      joining_date: ''
    });
    setFileUploads({
      cv: null,
      passportAttachment: null,
      photoOfEngineer: null
    });
    setIsEditing(false);
    setCurrentUserId(null);
    setSelectedUser(null);

    // Clear file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      (input as HTMLInputElement).value = '';
    });
  };

  const validatePassword = (password: string) => {
    if (!isEditing && !password) return true;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    const requiredFields = [
      'first_name', 'last_name', 'passport_number', 'email',
      'role_id', 'city', 'pincode', 'country_id', 'mobile'
    ];

    if (!isEditing) {
      requiredFields.push('password');
    }

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        alert(`Please fill in the ${field.replace(/_/g, ' ')} field`);
        return false;
      }
    }

    if (formData.password && !validatePassword(formData.password)) {
      alert('Password must contain at least:\n- One uppercase letter\n- One lowercase letter\n- One number\n- One special character\n- Minimum 8 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const formPayload = new FormData();

      // Append all non-file fields
      const formFields = [
        'first_name', 'last_name', 'passport_number', 'email', 'password',
        'role_id', 'address', 'city', 'state', 'pincode', 'country_id',
        'mobile', 'company_name', 'registration_id', 'work_experience',
        'passport_expiry_date', 'joining_date'
      ];

      formFields.forEach(field => {
        if (formData[field as keyof typeof formData]) {
          formPayload.append(field, formData[field as keyof typeof formData]);
        }
      });

      // Append files with correct field names
      if (fileUploads.cv) {
        formPayload.append('cv', fileUploads.cv);
      }
      if (fileUploads.passportAttachment) {
        formPayload.append('passportAttachment', fileUploads.passportAttachment);
      }
      if (fileUploads.photoOfEngineer) {
        formPayload.append('photoOfEngineer', fileUploads.photoOfEngineer);
      }

      let response;
      if (isEditing && currentUserId) {
        response = await updateUserById(currentUserId, formPayload);
      } else {
        response = await registerUser(formPayload);
      }

      console.log('API Response:', response.data);
      alert(`User ${isEditing ? 'updated' : 'created'} successfully!`);

      handleClear();
      fetchUsers();
      setActiveTab('view');
    } catch (error: any) {
      console.error('Error details:', error.response?.data || error.message);
      alert(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'save'} user. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentResponse = (response: any, docType: string, validContentTypes: string | string[]) => {
    console.log(`Handling ${docType} response...`);

    // Normalize content types to array
    const validTypes = Array.isArray(validContentTypes) ? validContentTypes : [validContentTypes];

    // Check for direct URL in response
    const url = response.data?.url || response.data;
    if (typeof url === 'string' && url.startsWith('http')) {
      console.log(`${docType} URL found:`, url);
      window.open(url, '_blank');
      return;
    }

    // Check content type
    const contentType = response.headers['content-type'];
    if (!contentType) {
      console.error('No content-type header found');
      throw new Error('Server did not provide content type');
    }

    // Validate content type
    const isValidType = validTypes.some(type => contentType.includes(type));
    if (!isValidType) {
      console.error(`Invalid content type: ${contentType}. Expected: ${validTypes.join(', ')}`);
      throw new Error(`Invalid file type: ${contentType.split(';')[0]}`);
    }

    // Handle binary data
    console.log(`Creating blob for ${docType} with type ${contentType}`);
    const blob = new Blob([response.data], { type: contentType });
    const fileUrl = URL.createObjectURL(blob);
    console.log(`Opening ${docType} from blob URL`);
    window.open(fileUrl, '_blank');

    // Clean up after some time
    setTimeout(() => {
      URL.revokeObjectURL(fileUrl);
      console.log(`Cleaned up ${docType} blob URL`);
    }, 10000);
  };

  const handleEdit = (user: UserType) => {
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      passport_number: user.passport_number,
      email: user.email,
      password: '',
      role_id: user.roles[0]?.id.toString() || '',
      address: user.address || '',
      city: user.city,
      state: user.state || '',
      pincode: user.pincode,
      country_id: user.country_id.toString() || '',
      mobile: user.mobile,
      company_name: user.company_name || '',
      registration_id: user.registration_id || '',
      work_experience: user.work_experience || '',
      passport_expiry_date: user.passport_expiry_date ? user.passport_expiry_date.split('T')[0] : '',
      joining_date: user.joining_date ? user.joining_date.split('T')[0] : ''
    });

    console.log('CV File:', user.cv);
    console.log('Passport Attachment File:', user.passportAttachment);
    console.log('Photo of Engineer File:', user.photoOfEngineer);

    setFileUploads({
      cv: user.cv ? new File([], user.cv) : null,
      passportAttachment: user.passportAttachment ? new File([], user.passportAttachment) : null,
      photoOfEngineer: user.photoOfEngineer ? new File([], user.photoOfEngineer) : null
    });
    console.log('File uploads set:', fileUploads); 

    setSelectedUser(user);
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
    borderRadius: 2,
    maxHeight: '90vh',
    overflowY: 'auto'
  };

  return (
    <Paper elevation={3} sx={{ p: 3, margin: 'auto', maxWidth: 1500, marginTop: 2 }}>
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
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Passport Number"
                name="passport_number"
                value={formData.passport_number}
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
              {!isEditing && (
                <TextField
                  fullWidth
                  label='Password'
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  margin="normal"
                  required={!isEditing}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              )}

              <FormControl fullWidth margin="normal" required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role_id"
                  value={formData.role_id}
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
                  name="country_id"
                  value={formData.country_id}
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
                required
              />
              <TextField
                fullWidth
                label="Company Name"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Registration ID"
                name="registration_id"
                value={formData.registration_id}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Work Experience"
                name="work_experience"
                value={formData.work_experience}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Passport Expiry Date"
                name="passport_expiry_date"
                type="date"
                value={formData.passport_expiry_date}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Joining Date"
                name="joining_date"
                type="date"
                value={formData.joining_date}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              {/* File Upload Fields */}
              <Box sx={{ mt: 2 }}>
                <InputLabel>CV (PDF only)</InputLabel>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, 'cv')}
                  id="cv-upload"
                  key={fileUploads.cv?.name || selectedUser?.cv}
                />
                {fileUploads.cv ? (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">
                      Selected: {fileUploads.cv.name}
                    </Typography>
                    <Button
                      onClick={() => {
                        setFileUploads(prev => ({ ...prev, cv: null }));
                        const input = document.getElementById('cv-upload') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : selectedUser?.cv && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Current file: <a href={selectedUser.cv} target="_blank" rel="noopener noreferrer">View CV</a>
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <InputLabel>Passport Attachment (PDF/JPEG/PNG)</InputLabel>
                <input
                  type="file"
                  accept=".pdf,.jpeg,.jpg,.png"
                  onChange={(e) => handleFileChange(e, 'passport')}
                  id="passport-upload"
                  key={fileUploads.passportAttachment?.name || selectedUser?.passportAttachment}
                />
                {fileUploads.passportAttachment ? (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">
                      Selected: {fileUploads.passportAttachment.name}
                    </Typography>
                    <Button
                      onClick={() => {
                        setFileUploads(prev => ({ ...prev, passportAttachment: null }));
                        const input = document.getElementById('passport-upload') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : selectedUser?.passportAttachment && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Current file: <a href={selectedUser.passportAttachment} target="_blank" rel="noopener noreferrer">View Passport</a>
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 2 }}>
                <InputLabel>Engineer Photo (JPEG/PNG)</InputLabel>
                <input
                  type="file"
                  accept=".jpeg,.jpg,.png"
                  onChange={(e) => handleFileChange(e, 'photo')}
                  id="photo-upload"
                  key={fileUploads.photoOfEngineer?.name || selectedUser?.photoOfEngineer}
                />
                {fileUploads.photoOfEngineer ? (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2">
                      Selected: {fileUploads.photoOfEngineer.name}
                    </Typography>
                    <Button
                      onClick={() => {
                        setFileUploads(prev => ({ ...prev, photoOfEngineer: null }));
                        const input = document.getElementById('photo-upload') as HTMLInputElement;
                        if (input) input.value = '';
                      }}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      Remove
                    </Button>
                  </Box>
                ) : selectedUser?.photoOfEngineer && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Current file: <a href={selectedUser.photoOfEngineer} target="_blank" rel="noopener noreferrer">View Photo</a>
                  </Typography>
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
                    {loading ? 'Updating...' : 'Update User'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
                    Clear
                  </Button>
                  <Button variant="contained" color="primary" type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Add User'}
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
                pageSizeOptions={[10, 50, 100]}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <h2>{selectedUser.first_name} {selectedUser.last_name}</h2>
                <IconButton onClick={() => setViewModalOpen(false)}>
                  <CancelIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
                <Box>
                  <Box sx={{ fontWeight: 'bold', textDecoration: 'underline', mb: 1 }}>
                    Personal Information
                  </Box>
                  <p><strong>Email:</strong> {selectedUser.email || "-"}</p>
                  <p><strong>Mobile:</strong> {selectedUser.mobile || "-"}</p>
                  <p><strong>Passport:</strong> {selectedUser.passport_number || "-"}</p>
                  <p><strong>Address:</strong> {selectedUser.address || "-"}</p>
                  <p><strong>City:</strong> {selectedUser.city || "-"}</p>
                  <p><strong>State:</strong> {selectedUser.state || "-"}</p>
                  <p><strong>Pincode:</strong> {selectedUser.pincode || "-"}</p>
                  <p><strong>Country:</strong> {selectedUser.country?.name || "-"}</p>
                </Box>

                <Box>
                  <Box sx={{ fontWeight: 'bold', textDecoration: 'underline', mb: 1 }}>
                    Professional Information
                  </Box>
                  <p><strong>Role:</strong> {selectedUser.roles.map(r => r.name).join(', ') || "-"}</p>
                  <p><strong>Company:</strong> {selectedUser.company_name || "-"}</p>
                  <p><strong>Registration ID:</strong> {selectedUser.registration_id || "-"}</p>
                  <p><strong>Work Experience:</strong> {selectedUser.work_experience || "-"}</p>
                  <p><strong>Passport Expiry:</strong> {selectedUser.passport_expiry_date || "-"}</p>
                  <p><strong>Status:</strong> {selectedUser.is_active ? 'Active' : 'Inactive'}</p>

                  <Box sx={{ mt: 1 }}>
                    <strong>Documents:</strong>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={async () => {
                          try {
                            if (selectedUser.cv) {
                              window.open(selectedUser.cv, '_blank');
                              return;
                            }
                            const response = await downloadCv(selectedUser.id);
                            handleDocumentResponse(response, 'CV', 'application/pdf');
                          } catch (error) {
                            console.error('CV download error:', error);
                            alert('Failed to view CV. Please try again.');
                          }
                        }}
                        size="small"
                      >
                        View CV
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={async () => {
                          try {
                            if (selectedUser.passportAttachment) {
                              window.open(selectedUser.passportAttachment, '_blank');
                              return;
                            }
                            const response = await downloadPassport(selectedUser.id);
                            handleDocumentResponse(
                              response,
                              'Passport',
                              ['image/jpeg', 'image/png', 'application/pdf']
                            );
                          } catch (error) {
                            console.error('Passport view error:', error);
                            alert(`Failed to view passport: ${error || 'Unknown error'}`);
                          }
                        }}
                        size="small"
                      >
                        View Passport
                      </Button>

                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={async () => {
                          try {
                            if (selectedUser.photoOfEngineer) {
                              window.open(selectedUser.photoOfEngineer, '_blank');
                              return;
                            }
                            const response = await downloadPhoto(selectedUser.id);
                            handleDocumentResponse(
                              response,
                              'Photo',
                              ['image/jpeg', 'image/png']
                            );
                          } catch (error) {
                            console.error('Photo view error:', error);
                            alert(`Failed to view photo: ${error || 'Unknown error'}`);
                          }
                        }}
                        size="small"
                      >
                        View Photo
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Paper>
  );
};

export default UserManagementPage;