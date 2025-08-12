import React, { useState, useEffect } from 'react';
import { useForm } from '../../context/FormContext';
import { fetchAllMachine } from '../../services/api';
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
  Link
} from '@mui/material';
import { AxiosResponse } from 'axios';

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

const MachineSelection: React.FC = () => {
  const { formState, setFormState } = useForm();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response: AxiosResponse<{ data: Machine[] }> = await fetchAllMachine();
        const machinesData = Array.isArray(response?.data?.data) ? response.data.data : [];
        setMachines(machinesData);
        
        if (formState.machineId) {
          const machine = machinesData.find(m => m.id === formState.machineId) || null;
          setSelectedMachine(machine);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMachineChange = (event: SelectChangeEvent) => {
    const machineId = event.target.value as string;
    const machine = machines.find(m => m.id === Number(machineId)) || null;
    
    setSelectedMachine(machine);
    setFormState(prev => ({
      ...prev,
      machineId: Number(machineId),
      machineName: machine ? machine.name : '',
      machineDetails: machine
    }));
  };

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
            disabled={loading}
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