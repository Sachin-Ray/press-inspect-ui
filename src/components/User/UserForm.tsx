import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, Briefcase, FileText, Globe,
  Building, ClipboardSignature, Eye, EyeOff, Search,
  MapPin, Home, CreditCard, Phone, X, Edit, ChevronLeft,
  Download, File, Image
} from 'lucide-react';
import { getRoles, registerUser, getUsers, getCountries, updateUserStatus } from '../../services/api.ts';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Switch from '@mui/material/Switch';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

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
  firstName: string;
  lastName: string;
  passportNumber: string;
  email: string;
  joiningDate: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  countryId: number;
  country: {
    id: number;
    name: string;
  };
  companyName: string | null;
  registrationId: string | null;
  cvUrl: string | null;
  workExperience: string | null;
  isActive: boolean;
  roles: Role[];
  mobile: string;
  passportExpiryDate: string;
  passportAttachment: string | null;
  photoOfEngineer: string | null;
}

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEditId, setCurrentEditId] = useState<number | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
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
    joiningDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Fetch roles and countries
    Promise.all([getRoles(), getCountries()])
      .then(([rolesRes, countriesRes]) => {
        setRoles(rolesRes.data.data);
        setCountries(countriesRes.data.data);
      })
      .catch(() => setError('Failed to load initial data'));
    
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    getUsers()
      .then((res) => setUsers(res.data.data))
      .catch(() => setError('Failed to load users'));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'passport' | 'photo') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      switch (type) {
        case 'cv':
          setCvFile(file);
          setFormData({...formData, cvUrl: URL.createObjectURL(file)});
          break;
        case 'passport':
          setPassportFile(file);
          setFormData({...formData, passportAttachment: URL.createObjectURL(file)});
          break;
        case 'photo':
          setPhotoFile(file);
          setFormData({...formData, photoOfEngineer: URL.createObjectURL(file)});
          break;
      }
    }
  };

  const validatePassword = (password: string) => {
    if (isEditMode && !password) return true; // Skip validation if editing and password not changed
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);

    if (!validatePassword(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character. It must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (!formData.countryId) {
      setError('Country is required');
      setLoading(false);
      return;
    }

    if (!formData.pincode) {
      setError('Pincode is required');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        passportNumber: formData.passportNumber,
        email: formData.email,
        password: formData.password,
        roleId: parseInt(formData.roleId, 10),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        countryId: parseInt(formData.countryId, 10),
        mobile: formData.mobile,
        companyName: formData.companyName,
        registrationId: formData.registrationId,
        cvUrl: formData.cvUrl,
        workExperience: formData.workExperience,
        passportExpiryDate: formData.passportExpiryDate,
        passportAttachment: formData.passportAttachment,
        photoOfEngineer: formData.photoOfEngineer,
        joiningDate: formData.joiningDate
      };

      // Here you would typically upload files and get their URLs
      // For now, we'll just use the local URLs
      
      if (isEditMode && currentEditId) {
        // Call update API here
        // await updateUser(currentEditId, payload);
        setSuccessMessage('User updated successfully!');
      } else {
        await registerUser(payload);
        setSuccessMessage('User created successfully!');
      }
      
      fetchUsers();
      resetForm();
      setActiveTab('view');
    } catch (err: any) {
      setError(err.response?.data?.message || (isEditMode ? 'User update failed' : 'User creation failed'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
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
      joiningDate: new Date().toISOString().split('T')[0]
    });
    setCvFile(null);
    setPassportFile(null);
    setPhotoFile(null);
    setIsEditMode(false);
    setCurrentEditId(null);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEdit = (user: UserType) => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      passportNumber: user.passportNumber,
      email: user.email,
      password: '', // Don't pre-fill password
      roleId: user.roles[0]?.id.toString() || '',
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode,
      countryId: user.countryId.toString(),
      mobile: user.mobile,
      companyName: user.companyName || '',
      registrationId: user.registrationId || '',
      cvUrl: user.cvUrl || '',
      workExperience: user.workExperience || '',
      passportExpiryDate: user.passportExpiryDate || '',
      passportAttachment: user.passportAttachment || '',
      photoOfEngineer: user.photoOfEngineer || '',
      joiningDate: user.joiningDate
    });
    setIsEditMode(true);
    setCurrentEditId(user.id);
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
      setSuccessMessage(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase()?.includes(term) ||
      user.lastName?.toLowerCase()?.includes(term) ||
      user.email?.toLowerCase()?.includes(term)
    );
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 180,
      valueGetter: (params) => `${params.row.firstName} ${params.row.lastName}`,
      renderCell: (params) => (
        <div className="font-medium">
          {params.row.firstName} {params.row.lastName}
        </div>
      )
    },
    { field: 'email', headerName: 'Email', width: 220 },
    { 
      field: 'role', 
      headerName: 'Role', 
      width: 150,
      valueGetter: (params) => params.row.roles.map((r: Role) => r.name).join(', ')
    },
    { 
      field: 'isActive', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <div className="flex items-center">
          <span className={`mr-2 text-sm ${params.value ? 'text-green-600' : 'text-red-600'}`}>
            {params.value ? 'Active' : 'Inactive'}
          </span>
          <Switch
            checked={params.value}
            onChange={(e) => handleStatusChange(params.row.id, e.target.checked)}
            color="success"
            size="small"
          />
        </div>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleView(params.row)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <Eye size={16} className="mr-1" /> View
          </button>
          <button
            onClick={() => handleEdit(params.row)}
            className="text-green-600 hover:text-green-800 text-sm flex items-center"
          >
            <Edit size={16} className="mr-1" /> Edit
          </button>
        </div>
      )
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

  const InputField = styled('input')({
    width: '100%',
    padding: '0.75rem',
    paddingLeft: '2.5rem',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    '&:focus': {
      outline: 'none',
      borderColor: '#16a34a',
      boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.2)'
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white rounded-3xl shadow-sm">
      {/* Tabs */}
      <div className="mb-6 flex space-x-4 border-b pb-2">
        <button
          className={`px-4 py-2 font-medium flex items-center ${activeTab === 'add' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          onClick={() => {
            setActiveTab('add');
            if (isEditMode) resetForm();
          }}
        >
          {isEditMode ? (
            <>
              <ChevronLeft size={18} className="mr-1" />
              Back to Add
            </>
          ) : (
            'Add New User'
          )}
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'view' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('view')}
        >
          View Users
        </button>
      </div>

      {/* Add/Edit User Form */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {isEditMode ? 'Edit User' : 'Create New User'}
            </h2>
            {isEditMode && (
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
              >
                <X size={16} className="mr-1" /> Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputField
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
              />
            </div>

            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputField
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
              />
            </div>

            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputField
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleChange}
                placeholder="Passport Number"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputField
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputField
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}
                required={!isEditMode}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <ClipboardSignature className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 text-sm"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputField
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputField
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputField
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputField
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                required
              />
            </div>

            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                name="countryId"
                value={formData.countryId}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 text-sm"
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>{country.code}-{country.name}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputField
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Mobile Number"
              />
            </div>

            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputField
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Company Name"
              />
            </div>

            <div className="relative">
              <ClipboardSignature className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputField
                name="registrationId"
                value={formData.registrationId}
                onChange={handleChange}
                placeholder="Registration ID"
              />
            </div>

            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <div className="flex items-center">
                <InputField
                  type="text"
                  value={cvFile?.name || (formData.cvUrl ? 'CV uploaded' : '')}
                  placeholder="Upload CV (PDF)"
                  readOnly
                  className="flex-1"
                />
                <label className="ml-2 px-3 py-2 bg-green-600 text-white rounded-lg cursor-pointer text-sm hover:bg-green-700 transition">
                  Browse
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'cv')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <InputField
                name="workExperience"
                value={formData.workExperience}
                onChange={handleChange}
                placeholder="Work Experience"
              />
            </div>

            <div className="relative">
              <File className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <div className="flex items-center">
                <InputField
                  type="text"
                  value={passportFile?.name || (formData.passportAttachment ? 'Passport uploaded' : '')}
                  placeholder="Upload Passport (PDF)"
                  readOnly
                  className="flex-1"
                />
                <label className="ml-2 px-3 py-2 bg-green-600 text-white rounded-lg cursor-pointer text-sm hover:bg-green-700 transition">
                  Browse
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'passport')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <div className="flex items-center">
                <InputField
                  type="text"
                  value={photoFile?.name || (formData.photoOfEngineer ? 'Photo uploaded' : '')}
                  placeholder="Upload Photo (JPG/PNG)"
                  readOnly
                  className="flex-1"
                />
                <label className="ml-2 px-3 py-2 bg-green-600 text-white rounded-lg cursor-pointer text-sm hover:bg-green-700 transition">
                  Browse
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}

          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center"
            >
              {loading ? (
                'Processing...'
              ) : isEditMode ? (
                'Update User'
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      )}

      {/* View Users */}
      {activeTab === 'view' && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Registered Users</h2>
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 text-sm"
              />
            </div>
          </div>

          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-cell': {
                  padding: '8px 16px'
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#f3f4f6',
                  borderRadius: '12px 12px 0 0'
                },
                '& .MuiDataGrid-virtualScroller': {
                  backgroundColor: 'white'
                }
              }}
            />
          </div>
        </div>
      )}

      {/* View User Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        aria-labelledby="user-details-modal"
        aria-describedby="user-details-description"
      >
        <Box sx={modalStyle}>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Personal Information</h3>
                  <DetailItem label="Email" value={selectedUser.email} icon={<Mail size={16} />} />
                  <DetailItem label="Mobile" value={selectedUser.mobile} icon={<Phone size={16} />} />
                  <DetailItem label="Passport Number" value={selectedUser.passportNumber} icon={<CreditCard size={16} />} />
                  <DetailItem label="Address" value={selectedUser.address} icon={<Home size={16} />} />
                  <DetailItem label="City" value={selectedUser.city} icon={<MapPin size={16} />} />
                  <DetailItem label="State" value={selectedUser.state} icon={<MapPin size={16} />} />
                  <DetailItem label="Pincode" value={selectedUser.pincode} icon={<MapPin size={16} />} />
                  <DetailItem label="Country" value={selectedUser.country?.name} icon={<Globe size={16} />} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Professional Information</h3>
                  <DetailItem label="Role" value={selectedUser.roles.map(r => r.name).join(', ')} icon={<ClipboardSignature size={16} />} />
                  <DetailItem label="Company" value={selectedUser.companyName} icon={<Building size={16} />} />
                  <DetailItem label="Registration ID" value={selectedUser.registrationId} icon={<ClipboardSignature size={16} />} />
                  <DetailItem label="Work Experience" value={selectedUser.workExperience} icon={<Briefcase size={16} />} />
                  <DetailItem label="Joining Date" value={selectedUser.joiningDate} icon={<FileText size={16} />} />
                  <DetailItem label="Status" value={selectedUser.isActive ? 'Active' : 'Inactive'} icon={selectedUser.isActive ? (
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  )} />

                  <div className="pt-4">
                    <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Documents</h3>
                    <div className="space-y-3 mt-2">
                      {selectedUser.cvUrl && (
                        <DocumentItem 
                          label="CV" 
                          url={selectedUser.cvUrl} 
                          icon={<FileText size={16} />} 
                        />
                      )}
                      {selectedUser.passportAttachment && (
                        <DocumentItem 
                          label="Passport" 
                          url={selectedUser.passportAttachment} 
                          icon={<File size={16} />} 
                        />
                      )}
                      {selectedUser.photoOfEngineer && (
                        <DocumentItem 
                          label="Photo" 
                          url={selectedUser.photoOfEngineer} 
                          icon={<Image size={16} />} 
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    handleEdit(selectedUser);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center"
                >
                  <Edit size={16} className="mr-2" /> Edit User
                </button>
              </div>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
};

const DetailItem = ({ label, value, icon }: { label: string; value: string | null | undefined; icon?: React.ReactNode }) => (
  <div className="flex items-start">
    <div className="text-gray-500 mr-2 mt-0.5">{icon}</div>
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-sm font-medium text-gray-800">{value || '-'}</div>
    </div>
  </div>
);

const DocumentItem = ({ label, url, icon }: { label: string; url: string; icon?: React.ReactNode }) => (
  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
    <div className="flex items-center">
      <div className="text-gray-500 mr-2">{icon}</div>
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </div>
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-green-600 hover:text-green-800 text-sm flex items-center"
    >
      <Download size={16} className="mr-1" /> Download
    </a>
  </div>
);

export default UserForm;