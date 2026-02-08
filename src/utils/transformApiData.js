import axios from 'axios';

export function transformApiData(apiData) {
  const { sheet, questions } = apiData;
  const { topicOrder, questionOrder } = sheet.config;

  // Create a map of questions by _id for quick lookup
  const questionsMap = new Map();
  questions.forEach((q) => {
    questionsMap.set(q._id, q);
  });

  // Initialize topics structure following topicOrder
  const topicsMap = new Map();

  topicOrder.forEach((topicName) => {
    const topicId = `topic-${topicName.toLowerCase().replace(/\s+/g, '-')}`;
    topicsMap.set(topicName, {
      id: topicId,
      title: topicName,
      subTopics: new Map(), // Using Map to track subTopics
    });
  });

  // Process questions in the order specified by questionOrder
  questionOrder.forEach((questionId) => {
    const question = questionsMap.get(questionId);
    if (!question) {
      console.warn(`Question with _id ${questionId} not found in questions array`);
      return;
    }

    const topicName = question.topic;
    const topic = topicsMap.get(topicName);

    if (!topic) {
      console.warn(`Topic "${topicName}" not found in topicOrder`);
      return;
    }

    // Handle subTopic: if null, use "General"
    const subTopicName = question.subTopic || "General";

    // Get or create subTopic
    if (!topic.subTopics.has(subTopicName)) {
      const subTopicId = `subtopic-${topicName}-${subTopicName}`
        .toLowerCase()
        .replace(/\s+/g, '-');
      topic.subTopics.set(subTopicName, {
        id: subTopicId,
        title: subTopicName,
        questions: [],
      });
    }

    const subTopic = topic.subTopics.get(subTopicName);

    // Transform question data
    const transformedQuestion = {
      id: question._id, // Use the original _id
      title: question.title || question.questionId?.name || "Untitled Question",
      difficulty: question.questionId?.difficulty || "Easy",
      link: question.questionId?.problemUrl || question.resource || "",
      solved: question.isSolved || false,
      platform: question.questionId?.platform || "Unknown",
    };

    subTopic.questions.push(transformedQuestion);
  });

  // Convert Maps to arrays in the correct order
  const transformedTopics = topicOrder.map((topicName) => {
    const topic = topicsMap.get(topicName);
    const subTopicsArray = Array.from(topic.subTopics.values());

    return {
      id: topic.id,
      title: topic.title,
      subTopics: subTopicsArray,
    };
  });

  return transformedTopics;
}

export async function fetchAndTransformSheetData(apiUrl) {
  try {
    const response = await axios.get(apiUrl);
    const responseData = response.data;
    
    // Handle the wrapped response structure: { status: {...}, data: { sheet: {...}, questions: [...] } }
    let apiData;
    if (responseData.data) {
      // Response is wrapped in { status, data }
      apiData = responseData.data;
    } else if (responseData.sheet) {
      // Direct structure
      apiData = responseData;
    } else {
      console.error('Unexpected API response structure:', responseData);
      throw new Error('Invalid API response structure: data or sheet not found');
    }
    
    // Validate API response structure
    if (!apiData.sheet || !apiData.sheet.config) {
      console.error('API data structure:', apiData);
      throw new Error('Invalid API response structure: sheet.config is missing');
    }

    if (!apiData.questions || !Array.isArray(apiData.questions)) {
      console.error('API data structure:', apiData);
      throw new Error('Invalid API response structure: questions array is missing');
    }

    if (!apiData.sheet.config.topicOrder || !Array.isArray(apiData.sheet.config.topicOrder)) {
      throw new Error('Invalid API response structure: sheet.config.topicOrder is missing or not an array');
    }

    if (!apiData.sheet.config.questionOrder || !Array.isArray(apiData.sheet.config.questionOrder)) {
      throw new Error('Invalid API response structure: sheet.config.questionOrder is missing or not an array');
    }

    return transformApiData(apiData);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}