import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import studyService from './studyService';

const initialState = {
    subjects: [],
    topics: [],
    currentTopic: null,
    aiSchedule: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
    quiz: null,
    quizResult: null,
    isQuizLoading: false,
};

// Async Thunks
export const getAIStudySchedule = createAsyncThunk('study/getSchedule', async (_, thunkAPI) => {
    try {
        return await studyService.getStudySchedule();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const getSubjects = createAsyncThunk('study/getSubjects', async (_, thunkAPI) => {
    try {
        return await studyService.getSubjects();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const createSubject = createAsyncThunk('study/createSubject', async (subjectData, thunkAPI) => {
    try {
        return await studyService.createSubject(subjectData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const updateSubject = createAsyncThunk('study/updateSubject', async (subjectData, thunkAPI) => {
    try {
        return await studyService.updateSubject(subjectData.id, subjectData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const deleteSubject = createAsyncThunk('study/deleteSubject', async (id, thunkAPI) => {
    try {
        await studyService.deleteSubject(id);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const getTopics = createAsyncThunk('study/getTopics', async (_, thunkAPI) => {
    try {
        return await studyService.getTopics();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const createTopic = createAsyncThunk('study/createTopic', async (topicData, thunkAPI) => {
    try {
        return await studyService.createTopic(topicData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const updateTopic = createAsyncThunk('study/updateTopic', async (topicData, thunkAPI) => {
    try {
        return await studyService.updateTopic(topicData.id, topicData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const deleteTopic = createAsyncThunk('study/deleteTopic', async (id, thunkAPI) => {
    try {
        await studyService.deleteTopic(id);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const reviewTopic = createAsyncThunk('study/reviewTopic', async (id, thunkAPI) => {
    try {
        return await studyService.reviewTopic(id);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const getTopic = createAsyncThunk('study/getTopic', async (id, thunkAPI) => {
    try {
        return await studyService.getTopic(id);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const generateRoadmap = createAsyncThunk('study/generateRoadmap', async (id, thunkAPI) => {
    try {
        return await studyService.generateRoadmap(id);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const fetchStepResources = createAsyncThunk('study/fetchStepResources', async ({ id, stepTitle }, thunkAPI) => {
    try {
        return await studyService.getStepResources(id, stepTitle);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const getTopicQuiz = createAsyncThunk('study/getTopicQuiz', async (id, thunkAPI) => {
    try {
        return await studyService.getQuiz(id);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const submitTopicQuiz = createAsyncThunk('study/submitTopicQuiz', async ({ id, answers }, thunkAPI) => {
    try {
        return await studyService.submitQuiz(id, answers);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const getStepQuiz = createAsyncThunk('study/getStepQuiz', async ({ id, stepIndex }, thunkAPI) => {
    try {
        return await studyService.getStepQuiz(id, stepIndex);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const submitStepQuiz = createAsyncThunk('study/submitStepQuiz', async ({ id, stepIndex, answers }, thunkAPI) => {
    try {
        return await studyService.submitStepQuiz(id, stepIndex, answers);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.toString());
    }
});

export const studySlice = createSlice({
    name: 'study',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
            state.quiz = null;
            state.quizResult = null;
            state.isQuizLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // AI Schedule
            .addCase(getAIStudySchedule.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.aiSchedule = action.payload;
            })
            // Subjects
            .addCase(getSubjects.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.subjects = action.payload;
            })
            .addCase(createSubject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.subjects.push(action.payload);
            })
            .addCase(updateSubject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.subjects.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.subjects[index] = action.payload;
                }
            })
            .addCase(deleteSubject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.subjects = state.subjects.filter(s => s._id !== action.payload);
            })
            // Topics
            .addCase(getTopics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.topics = action.payload;
            })
            .addCase(createTopic.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.topics.push(action.payload);
            })
            .addCase(updateTopic.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.topics.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.topics[index] = action.payload;
                }
            })
            .addCase(deleteTopic.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.topics = state.topics.filter(t => t._id !== action.payload);
            })
            .addCase(reviewTopic.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.topics.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.topics[index] = action.payload;
                }
            })
            .addCase(getTopic.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.currentTopic = action.payload;
            })
            .addCase(generateRoadmap.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.currentTopic = action.payload;
                // Update in topics list as well if exists
                const index = state.topics.findIndex(t => t._id === action.payload._id);
                if (index !== -1) {
                    state.topics[index] = action.payload;
                }
            })
            // Quiz
            .addCase(getTopicQuiz.pending, (state) => {
                state.isQuizLoading = true;
            })
            .addCase(getTopicQuiz.fulfilled, (state, action) => {
                state.isQuizLoading = false;
                state.quiz = action.payload;
            })
            .addCase(getTopicQuiz.rejected, (state, action) => {
                state.isQuizLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(submitTopicQuiz.pending, (state) => {
                state.isQuizLoading = true;
            })
            .addCase(submitTopicQuiz.fulfilled, (state, action) => {
                state.isQuizLoading = false;
                state.quizResult = action.payload; // { score, total, percentage, areasToImprove, subjectCompleted }
            })
            .addCase(submitTopicQuiz.rejected, (state, action) => {
                state.isQuizLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Step Quiz
            .addCase(getStepQuiz.pending, (state) => {
                state.isQuizLoading = true;
            })
            .addCase(getStepQuiz.fulfilled, (state, action) => {
                state.isQuizLoading = false;
                state.quiz = action.payload;
            })
            .addCase(getStepQuiz.rejected, (state, action) => {
                state.isQuizLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(submitStepQuiz.pending, (state) => {
                state.isQuizLoading = true;
            })
            .addCase(submitStepQuiz.fulfilled, (state, action) => {
                state.isQuizLoading = false;
                state.quizResult = action.payload;
            })
            .addCase(submitStepQuiz.rejected, (state, action) => {
                state.isQuizLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // General matchers for pending and rejected states
            // These MUST come after all addCase calls
            .addMatcher(
                (action) => action.type.endsWith('/pending'),
                (state) => {
                    state.isLoading = true;
                }
            )
            .addMatcher(
                (action) => action.type.endsWith('/rejected'),
                (state, action) => {
                    state.isLoading = false;
                    state.isError = true;
                    state.message = action.payload;
                }
            );
    },
});

export const { reset } = studySlice.actions;
export default studySlice.reducer; 