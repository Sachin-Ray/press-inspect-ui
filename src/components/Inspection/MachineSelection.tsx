import React, { useState, useEffect } from 'react';
import { useForm } from '../../context/FormContext';
import { fetchAllMachine } from '../../services/api';
// import { fetchAllMachine, saveMachineSelection } from '../../services/api';
import {
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
  Grid,
  Divider,
  Card,
  CardContent,
  Button,
  Link,
  CircularProgress,
  Alert
} from '@mui/material';
import { AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { Description } from '@mui/icons-material';

interface Machine {
  id: number;
  name: string;
  serial_number: string;
  total_impressions: string;
  manufacturer: string;
  year: number;
  group_id: number;
  seller_id: number;
  buyer_id: number;
  group: {
    id: number;
    name: string;
  };
  seller: {
    id: number;
    company_name: string;
    address: string;
  };
  buyer: {
    id: number;
    company_name: string;
    address: string;
  };
  technicalSpecification: {
    id: number;
    model_id: number;
    date_of_upload: string;
    pdf: string;
    file_name: string | null;
  } | null;
}

interface MachineSelectionProps {
  onComplete?: () => void;
}

const MachineSelection: React.FC<MachineSelectionProps> = ({ onComplete }) => {
  const { formState, setFormState } = useForm();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState({
    machines: true,
    selection: false
  });
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, machines: true }));
        const response: AxiosResponse<{ data: Machine[] }> = await fetchAllMachine();
        const machinesData = Array.isArray(response?.data?.data) ? response.data.data : [];
        setMachines(machinesData);
        
        if (formState.machineId) {
          const machine = machinesData.find(m => m.id === formState.machineId) || null;
          setSelectedMachine(machine);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load machines');
      } finally {
        setLoading(prev => ({ ...prev, machines: false }));
      }
    };

    fetchData();
  }, []);

  const handleMachineChange = async (event: SelectChangeEvent) => {
    const machineId = event.target.value as string;
    const machine = machines.find(m => m.id === Number(machineId)) || null;
    
    try {
      setLoading(prev => ({ ...prev, selection: true }));
      
      // Save selection to backend
      if (machine) {
        // await saveMachineSelection(machine.id);
        toast.success('Machine selection saved');
      }

      setSelectedMachine(machine);
      setFormState(prev => ({
        ...prev,
        machineId: Number(machineId),
        machineName: machine ? machine.name : '',
        machineDetails: machine
      }));

      // Automatically proceed if onComplete is provided
      if (machine && onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error saving selection:', err);
      toast.error('Failed to save machine selection');
    } finally {
      setLoading(prev => ({ ...prev, selection: false }));
    }
  };

  if (loading.machines) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, margin: 'auto' }}>
      <Box sx={{ mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="machine-select-label">Select Machine</InputLabel>
          <Select
            labelId="machine-select-label"
            label="Select Machine"
            value={formState.machineId?.toString() || ''}
            onChange={handleMachineChange}
            disabled={loading.selection}
          >
            <MenuItem value="">
              <em>Select a machine</em>
            </MenuItem>
            {machines.map(machine => (
              <MenuItem key={machine.id} value={machine.id}>
                {machine.name} - {machine.serial_number}
              </MenuItem>
            ))}
          </Select>
          {loading.selection && (
            <CircularProgress size={24} sx={{ position: 'absolute', right: 40, top: '50%' }} />
          )}
        </FormControl>
      </Box>

      {selectedMachine && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Machine Details
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Machine Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography><strong>Name:</strong> {selectedMachine.name}</Typography>
                    <Typography><strong>Serial Number:</strong> {selectedMachine.serial_number}</Typography>
                    <Typography><strong>Manufacturer:</strong> {selectedMachine.manufacturer}</Typography>
                    <Typography><strong>Year:</strong> {selectedMachine.year}</Typography>
                    <Typography><strong>Total Impressions:</strong> {selectedMachine.total_impressions}</Typography>
                    
                    {selectedMachine.technicalSpecification && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                          Technical Specification
                        </Typography>
                        <Button
                          variant="contained"
                          component={Link}
                          href={selectedMachine.technicalSpecification.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<Description />}
                        >
                          View PDF
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Group Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography><strong>Group Name:</strong> {selectedMachine.group.name}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Seller Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography><strong>Company Name:</strong> {selectedMachine.seller.company_name}</Typography>
                    <Typography><strong>Address:</strong> {selectedMachine.seller.address}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Buyer Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography><strong>Company Name:</strong> {selectedMachine.buyer.company_name}</Typography>
                    <Typography><strong>Address:</strong> {selectedMachine.buyer.address}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default MachineSelection;