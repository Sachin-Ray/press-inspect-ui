import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, Briefcase, FileText, Globe,
  Building, ClipboardSignature, Eye, EyeOff, Search
} from 'lucide-react';
import { getRoles, registerUser, getUsers } from '../../services/api.ts';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface Role {
  id: number;
  name: string;
}

interface UserType {
  id: number;
  email: string;
  username: string;
  country: string;
  phone_number: string | null;
  registration_id: string | null;
  company_name: string | null;
  cv_url: string | null;
  work_experience: string | null;
  roles: Role[];
}

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  const [users, setUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50, // changed here
  });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roleId: '',
    country: '',
    companyName: '',
    registrationId: '',
    cvUrl: '',
    workExperience: ''
  });

  useEffect(() => {
    getRoles()
      .then((res) => setRoles(res.data.data))
      .catch(() => setError('Failed to load roles'));
    
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

  // Password validation function
  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null); // Reset success message on each submission

    // Validate the fields
    if (!validatePassword(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character. It must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (!formData.country) {
      setError('Country should not be empty');
      setLoading(false);
      return;
    }

    if (!formData.registrationId) {
      setError('Registration ID should not be empty');
      setLoading(false);
      return;
    }

    try {
      const updatedFormData = {
        ...formData,
        roleId: parseInt(formData.roleId, 10),
      };
      await registerUser(updatedFormData);
      fetchUsers();
      // setActiveTab('view');
      setFormData({
        username: '',
        email: '',
        password: '',
        roleId: '',
        country: '',
        companyName: '',
        registrationId: '',
        cvUrl: '',
        workExperience: ''
      }); // Clear form data after submission
      setSuccessMessage('User created successfully!');
    } catch (err) {
      setError('User creation failed');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEdit = (userId: number) => {
    navigate(`/edit-user/${userId}`);
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'Username', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'country', headerName: 'Country', width: 150 },
    { field: 'company_name', headerName: 'Company', width: 200 },
    { field: 'registration_id', headerName: 'Registration ID', width: 180 },
    { field: 'cv_url', headerName: 'CV URL', width: 200 },
    { field: 'work_experience', headerName: 'Experience', width: 150 },
    {
      field: 'roles',
      headerName: 'Role',
      width: 150,
      valueGetter: (params) => params.row.roles.map((r: Role) => r.name).join(', ')
    },
    {
      field: 'action',
      headerName: 'Action',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(params.row.id)}
            className="text-blue-600 hover:underline text-sm"
          >
            Edit
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white rounded-3xl">
      {/* Tabs */}
      <div className="mb-6 flex space-x-4 border-b pb-2">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'add' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('add')}
        >
          Add New User
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'view' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('view')}
        >
          View Users
        </button>
      </div>

      {/* Add User Form */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField icon={<User size={20} />} name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
            <InputField icon={<Mail size={20} />} name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" required />
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><Lock size={20} /></div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 text-sm"
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

            <InputField icon={<Globe size={20} />} name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
            <InputField icon={<Building size={20} />} name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Company Name" />
            <InputField icon={<ClipboardSignature size={20} />} name="registrationId" value={formData.registrationId} onChange={handleChange} placeholder="Registration ID" />
            <InputField icon={<FileText size={20} />} name="cvUrl" value={formData.cvUrl} onChange={handleChange} placeholder="CV URL" type="url" />
            <InputField icon={<Briefcase size={20} />} name="workExperience" value={formData.workExperience} onChange={handleChange} placeholder="Work Experience" />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-sm font-medium transition-all"
            >
              {loading ? 'Saving...' : 'Create User'}
            </button>
          </div>
        </form>
      )}

      {/* View Users */}
      {activeTab === 'view' && (
        <div style={{ marginTop: '2rem' }}>
          <h5 className="text-lg font-semibold mb-4">Registered Users</h5>
          {/* Search Input */}
          <div className="mb-4 flex items-center space-x-2 w-full md:w-1/2">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by username or email"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          <div style={{ height: 400 }}>
            <DataGrid
              rows={filteredUsers}
              columns={columns}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[5, 10, 20, 50]} 
              disableRowSelectionOnClick
            />
          </div>
        </div>
      )}
    </div>
  );

};

interface InputProps {
  icon: React.ReactNode;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}

const InputField: React.FC<InputProps> = ({
  icon, name, value, onChange, placeholder, type = 'text', required = false
}) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 text-sm"
    />
  </div>
);

export default UserForm;
