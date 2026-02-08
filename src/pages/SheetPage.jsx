import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import useSheetStore from "../store/sheetStore";
import TopicCard from "../components/Topic/TopicCard";

function SheetPage() {
  const { topics, isLoading, error, fetchSheetData, addTopic, reorderTopics } = useSheetStore();
  const [title, setTitle] = useState("");

  // TODO: Replace with your actual API endpoint
  const API_URL = import.meta.env.VITE_API_URL;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (API_URL) {
      fetchSheetData(API_URL);
    }
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = topics.findIndex((topic) => topic.id === active.id);
      const newIndex = topics.findIndex((topic) => topic.id === over.id);
      reorderTopics(oldIndex, newIndex);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sheet data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => fetchSheetData(API_URL)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interactive Question Management Sheet
          </h1>
        </div>

        {/* Add Topic Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new topic name..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && title.trim()) {
                  addTopic(title.trim());
                  setTitle("");
                }
              }}
            />
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              onClick={() => {
                if (title.trim()) {
                  addTopic(title.trim());
                  setTitle("");
                }
              }}
            >
              Add Topic
            </button>
          </div>
        </div>

        {/* Topics List with Drag & Drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={topics.map((topic) => topic.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {topics.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-500 text-lg mb-2">No topics found</p>
                  <p className="text-gray-400 text-sm">
                    Add a new topic above or load data from API
                  </p>
                </div>
              ) : (
                topics.map((topic) => <TopicCard key={topic.id} topic={topic} />)
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

export default SheetPage;