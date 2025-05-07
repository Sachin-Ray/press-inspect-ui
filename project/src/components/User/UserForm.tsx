import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, Briefcase, FileText, Globe, Building, ClipboardSignature } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Role {
  id: number;
  name: string;
}

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log("Fetching roles with token:", token);
    
    axios.get('http://localhost:4000/api/roles', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    .then(res => {
      console.log("Roles fetched:", res.data);
      setRoles(res.data.data);
    })
    .catch(err => {
      console.error("Error fetching roles:", err);
      setError('Failed to load roles');
    });
  }, []);
  
  
// axios.get('/api/roles')
//   .then(res => {
//     const fetchedRoles = res?.data?.data;
//     if (Array.isArray(fetchedRoles)) {
//       setRoles(fetchedRoles);
//     } else {
//       setRoles([]); // Fallback to empty array
//       setError('No roles found.');
//     }
//   })
//   .catch(() => {
//     setRoles([]); // Prevent map error
//     setError('Failed to load roles');
//   });


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/register', formData);
      navigate('/admin/users'); // Change as needed
    } catch (err) {
      setError('User creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-6 py-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New User</h2>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField icon={<User size={20} />} name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
          <InputField icon={<Mail size={20} />} name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" required />
          <InputField icon={<Lock size={20} />} name="password" value={formData.password} onChange={handleChange} placeholder="Password" type="password" required />
          
          <div className="relative">
            <ClipboardSignature className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-green-600 focus:ring focus:ring-green-100 text-sm text-gray-700"
            >
              <option value="">Select Role</option>
              {Array.isArray(roles) && roles.map(role => (
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

        <div className="text-right">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-medium"
          >
            {loading ? 'Saving...' : 'Create User'}
          </button>
        </div>
      </form>
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

const InputField: React.FC<InputProps> = ({ icon, name, value, onChange, placeholder, type = 'text', required = false }) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-green-600 focus:ring focus:ring-green-100 text-sm text-gray-700 placeholder-gray-400"
    />
  </div>
);

export default UserForm;
