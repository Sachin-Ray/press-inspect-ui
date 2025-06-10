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
import {
  createGeneralInfoQuestion,
  fetchAllGeneralInfoQuestions,
  updateGeneralInfoQuestionById
} from '../services/api';

interface GeneralInfoQuestion {
  id: number;
  question: string;
}

const GeneralInformationQuestionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');
  const [questions, setQuestions] = useState<GeneralInfoQuestion[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<GeneralInfoQuestion[]>([]);
  const [formData, setFormData] = useState<{ question: string }>({ question: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetchAllGeneralInfoQuestions();
      const data = (response?.data?.data || []).map((item: any) => ({
        id: item.id,
        question: item.question
      }));
      setQuestions(data);
      setFilteredQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'view') fetchQuestions();
  }, [activeTab]);

  useEffect(() => {
    const filtered = questions.filter((q) =>
      (q?.question || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredQuestions(filtered);
  }, [searchTerm, questions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClear = () => {
    setFormData({ question: '' });
    setIsEditing(false);
    setCurrentQuestionId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiData = {
      question: formData.question.trim()
    };
    try {
      if (isEditing && currentQuestionId) {
        await updateGeneralInfoQuestionById(currentQuestionId, apiData);
      } else {
        await createGeneralInfoQuestion(apiData);
      }
      handleClear();
      if (activeTab === 'view') fetchQuestions();
      setActiveTab('view');
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  const handleEdit = (question: GeneralInfoQuestion) => {
    setFormData({ question: question.question });
    setIsEditing(true);
    setCurrentQuestionId(question.id);
    setActiveTab('add');
  };

  const columns: GridColDef[] = [
    { field: 'question', headerName: 'Question', flex: 1, minWidth: 300 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row as GeneralInfoQuestion)}
        />
      ]
    }
  ];

  return (
    <Paper elevation={3} sx={{ p: 3, margin: 'auto', maxWidth:1500, marginTop:2}}>
      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <Tab label={isEditing ? 'Edit Question' : 'Add New Question'} value="add" />
        <Tab label="View Questions" value="view" />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {activeTab === 'add' ? (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Question"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              margin="normal"
              required
              multiline
              minRows={2}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {isEditing ? (
                <>
                  <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleClear}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" startIcon={<SaveIcon />} type="submit">
                    Update
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
                    Clear
                  </Button>
                  <Button variant="contained" color="primary" type="submit">
                    Add
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
                placeholder="Search question..."
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
                rows={filteredQuestions}
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
    </Paper>
  );
};

export default GeneralInformationQuestionsPage;
