import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import type { Note, NoteUpdate } from '../../types';

interface NoteState {
  notes: Note[];
  tags: string[];
  loading: boolean;
  error: string | null;
}

const initialState: NoteState = {
  notes: [],
  tags: [],
  loading: false,
  error: null,
};

export const fetchNotes = createAsyncThunk('notes/fetchNotes', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/notes');
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch notes');
  }
});

export const fetchTags = createAsyncThunk('notes/fetchTags', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/notes/tags');
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tags');
  }
});

export const createNote = createAsyncThunk('notes/createNote', async (note: NoteUpdate, { rejectWithValue }) => {
  try {
    const response = await api.post('/notes', note);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create note');
  }
});

export const updateNote = createAsyncThunk('notes/updateNote', async ({ id, updates }: { id: string, updates: NoteUpdate }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/notes/${id}`, updates);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update note');
  }
});

export const deleteNote = createAsyncThunk('notes/deleteNote', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/notes/${id}`);
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete note');
  }
});

export const bulkDeleteNotes = createAsyncThunk('notes/bulkDeleteNotes', async (ids: string[], { rejectWithValue }) => {
  try {
    await api.delete('/notes/bulk', { data: { ids } });
    return ids;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete notes');
  }
});

const noteSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => { state.loading = true; })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.tags = action.payload;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload);
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.notes.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.notes = state.notes.filter(n => n._id !== action.payload);
      })
      .addCase(bulkDeleteNotes.fulfilled, (state, action) => {
        state.notes = state.notes.filter(n => !action.payload.includes(n._id));
      });
  },
});

export default noteSlice.reducer;
