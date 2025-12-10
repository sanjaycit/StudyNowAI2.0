import axiosInstance from '../../services/axiosInstance';

// Get AI Study Schedule
const getStudySchedule = async () => {
    const response = await axiosInstance.get('/api/study/schedule');
    return response.data;
};

// Get all subjects
const getSubjects = async () => {
    const response = await axiosInstance.get('/api/subjects');
    return response.data;
};

// Create a subject
const createSubject = async (subjectData) => {
    const response = await axiosInstance.post('/api/subjects', subjectData);
    return response.data;
};

// Update a subject
const updateSubject = async (id, subjectData) => {
    const response = await axiosInstance.put(`/api/subjects/${id}`, subjectData);
    return response.data;
};

// Delete a subject
const deleteSubject = async (id) => {
    const response = await axiosInstance.delete(`/api/subjects/${id}`);
    return response.data;
};

// Get all topics
const getTopics = async () => {
    const response = await axiosInstance.get('/api/topics');
    return response.data;
};

// Create a topic
const createTopic = async (topicData) => {
    const response = await axiosInstance.post('/api/topics', topicData);
    return response.data;
};

// Update a topic
const updateTopic = async (id, topicData) => {
    const response = await axiosInstance.put(`/api/topics/${id}`, topicData);
    return response.data;
};

// Delete a topic
const deleteTopic = async (id) => {
    const response = await axiosInstance.delete(`/api/topics/${id}`);
    return response.data;
};

const studyService = {
    getStudySchedule,
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    getTopics,
    createTopic,
    updateTopic,
    deleteTopic,
    reviewTopic: async (id) => {
        const response = await axiosInstance.put(`/api/topics/${id}/review`);
        return response.data;
    },
    getTopic: async (id) => {
        const response = await axiosInstance.get(`/api/topics/${id}`);
        return response.data;
    },
    generateRoadmap: async (id) => {
        const response = await axiosInstance.post(`/api/topics/${id}/roadmap`);
        return response.data;
    },
    getStepResources: async (id, stepTitle) => {
        const response = await axiosInstance.post(`/api/topics/${id}/resources`, { stepTitle });
        return response.data;
    },
    getQuiz: async (id) => {
        const response = await axiosInstance.get(`/api/topics/${id}/quiz`);
        return response.data;
    },
    submitQuiz: async (id, answers) => {
        const response = await axiosInstance.post(`/api/topics/${id}/quiz`, { answers });
        return response.data;
    },
    getStepQuiz: async (id, stepIndex) => {
        const response = await axiosInstance.get(`/api/topics/${id}/roadmap/steps/${stepIndex}/quiz`);
        return response.data;
    },
    submitStepQuiz: async (id, stepIndex, answers) => {
        const response = await axiosInstance.post(`/api/topics/${id}/roadmap/steps/${stepIndex}/quiz`, { answers });
        return response.data;
    },
};

export default studyService; 