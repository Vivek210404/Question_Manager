import { create } from "zustand";
import { fetchAndTransformSheetData } from "../utils/transformApiData";

const STORAGE_KEY = "codolio-sheet-data";

// Load from localStorage
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
  return null;
};

// Save to localStorage
const saveToStorage = (topics) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

const useSheetStore = create((set, get) => ({
  // Initial state - try to load from localStorage first
  topics: loadFromStorage() || [],
  isLoading: false,
  error: null,

  // Fetch and load sheet data from API
  fetchSheetData: async (apiUrl) => {
    set({ isLoading: true, error: null });
    try {
      const transformedTopics = await fetchAndTransformSheetData(apiUrl);
      set({ topics: transformedTopics, isLoading: false });
      saveToStorage(transformedTopics);
    } catch (error) {
      set({ 
        error: error.message || 'Failed to fetch sheet data', 
        isLoading: false 
      });
    }
  },

  // Set topics (will be used after API transformation)
  setTopics: (topics) => {
    set({ topics });
    saveToStorage(topics);
  },

  // Helper function to save state after any mutation
  saveState: () => {
    const state = get();
    saveToStorage(state.topics);
  },

  // ========== TOPIC CRUD ==========
  addTopic: (title) => {
    set((state) => {
      const newTopics = [
        ...state.topics,
        {
          id: `topic-${Date.now()}`,
          title,
          subTopics: [
            {
              id: `subtopic-${Date.now()}-general`,
              title: "General",
              questions: [],
            },
          ],
        },
      ];
      saveToStorage(newTopics);
      return { topics: newTopics };
    });
  },

  updateTopic: (topicId, newTitle) => {
    set((state) => {
      const newTopics = state.topics.map((topic) =>
        topic.id === topicId ? { ...topic, title: newTitle } : topic
      );
      saveToStorage(newTopics);
      return { topics: newTopics };
    });
  },

  deleteTopic: (topicId) => {
    set((state) => {
      const newTopics = state.topics.filter((topic) => topic.id !== topicId);
      saveToStorage(newTopics);
      return { topics: newTopics };
    });
  },

  reorderTopics: (startIndex, endIndex) => {
    const state = get();
    const newTopics = Array.from(state.topics);
    const [removed] = newTopics.splice(startIndex, 1);
    newTopics.splice(endIndex, 0, removed);
    set({ topics: newTopics });
    saveToStorage(newTopics);
  },

  // ========== SUBTOPIC CRUD ==========
  addSubTopic: (topicId, title) => {
    set((state) => {
      const newTopics = state.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              subTopics: [
                ...topic.subTopics,
                {
                  id: `subtopic-${Date.now()}`,
                  title,
                  questions: [],
                },
              ],
            }
          : topic
      );
      saveToStorage(newTopics);
      return { topics: newTopics };
    });
  },

  updateSubTopic: (topicId, subTopicId, newTitle) => {
    set((state) => {
      const newTopics = state.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              subTopics: topic.subTopics.map((subTopic) =>
                subTopic.id === subTopicId
                  ? { ...subTopic, title: newTitle }
                  : subTopic
              ),
            }
          : topic
      );
      saveToStorage(newTopics);
      return { topics: newTopics };
    });
  },

  deleteSubTopic: (topicId, subTopicId) => {
    set((state) => {
      const newTopics = state.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              subTopics: topic.subTopics.filter(
                (subTopic) => subTopic.id !== subTopicId
              ),
            }
          : topic
      );
      saveToStorage(newTopics);
      return { topics: newTopics };
    });
  },

  reorderSubTopics: (topicId, startIndex, endIndex) => {
    const state = get();
    const topic = state.topics.find((t) => t.id === topicId);
    if (!topic) return;

    const newSubTopics = Array.from(topic.subTopics);
    const [removed] = newSubTopics.splice(startIndex, 1);
    newSubTopics.splice(endIndex, 0, removed);

    set((state) => {
      const newTopics = state.topics.map((t) =>
        t.id === topicId ? { ...t, subTopics: newSubTopics } : t
      );
      saveToStorage(newTopics);
      return { topics: newTopics };
    });
  },

  // ========== QUESTION CRUD ==========
  addQuestion: (topicId, subTopicId, questionData) => {
    set((state) => {
      const newTopics = state.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              subTopics: topic.subTopics.map((subTopic) =>
                subTopic.id === subTopicId
                  ? {
                      ...subTopic,
                      questions: [
                        ...subTopic.questions,
                        {
                          id: `question-${Date.now()}`,
                          title: questionData.title || "New Question",
                          difficulty: questionData.difficulty || "Easy",
                          link: questionData.link || "",
                          solved: questionData.solved || false,
                          platform: questionData.platform || "Unknown",
                        },
                      ],
                    }
                  : subTopic
              ),
            }
          : topic
      );
      saveToStorage(newTopics);
      return { topics: newTopics };
    });
  },

  updateQuestion: (topicId, subTopicId, questionId, updatedData) => {
    set((state) => {
      const newTopics = state.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              subTopics: topic.subTopics.map((subTopic) =>
                subTopic.id === subTopicId
                  ? {
                      ...subTopic,
                      questions: subTopic.questions.map((question) =>
                        question.id === questionId
                          ? { ...question, ...updatedData }
                          : question
                      ),
                    }
                  : subTopic
              ),
            }
          : topic
      );
      saveToStorage(newTopics);
      return { topics: newTopics };
    });
  },

  deleteQuestion: (topicId, subTopicId, questionId) => {
    set((state) => {
      const newTopics = state.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              subTopics: topic.subTopics.map((subTopic) =>
                subTopic.id === subTopicId
                  ? {
                      ...subTopic,
                      questions: subTopic.questions.filter(
                        (question) => question.id !== questionId
                      ),
                    }
                  : subTopic
              ),
            }
          : topic
      );
      saveToStorage(newTopics);
      return { topics: newTopics };
    });
  },

  toggleQuestionSolved: (topicId, subTopicId, questionId) => {
    const state = get();
    const topic = state.topics.find((t) => t.id === topicId);
    if (!topic) return;

    const subTopic = topic.subTopics.find((st) => st.id === subTopicId);
    if (!subTopic) return;

    const question = subTopic.questions.find((q) => q.id === questionId);
    if (!question) return;

    get().updateQuestion(topicId, subTopicId, questionId, {
      solved: !question.solved,
    });
  },

  reorderQuestions: (topicId, subTopicId, startIndex, endIndex) => {
    const state = get();
    const topic = state.topics.find((t) => t.id === topicId);
    if (!topic) return;

    const subTopic = topic.subTopics.find((st) => st.id === subTopicId);
    if (!subTopic) return;

    const newQuestions = Array.from(subTopic.questions);
    const [removed] = newQuestions.splice(startIndex, 1);
    newQuestions.splice(endIndex, 0, removed);

    set((state) => {
      const newTopics = state.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              subTopics: t.subTopics.map((st) =>
                st.id === subTopicId
                  ? { ...st, questions: newQuestions }
                  : st
              ),
            }
          : t
      );
      saveToStorage(newTopics);
      return { topics: newTopics };
    });
  },
}));

export default useSheetStore;