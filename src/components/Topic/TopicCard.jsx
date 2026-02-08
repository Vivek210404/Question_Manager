import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SubTopicBlock from "../SubTopic/SubTopicBlock";
import useSheetStore from "../../store/sheetStore";

function TopicCard({ topic }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(topic.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { updateTopic, deleteTopic, addSubTopic, reorderSubTopics } = useSheetStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate progress: count solved questions across all subTopics
  const totalQuestions = topic.subTopics.reduce(
    (sum, subTopic) => sum + subTopic.questions.length,
    0
  );
  const solvedQuestions = topic.subTopics.reduce(
    (sum, subTopic) =>
      sum + subTopic.questions.filter((q) => q.solved).length,
    0
  );
  const progressPercentage =
    totalQuestions > 0 ? (solvedQuestions / totalQuestions) * 100 : 0;

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      updateTopic(topic.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(topic.title);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteTopic(topic.id);
    setShowDeleteConfirm(false);
  };

  const handleSubTopicDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = topic.subTopics.findIndex((st) => st.id === active.id);
      const newIndex = topic.subTopics.findIndex((st) => st.id === over.id);
      reorderSubTopics(topic.id, oldIndex, newIndex);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
        isDragging ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {/* Topic Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {/* Left side: Drag Handle + Expand/Collapse + Title */}
          <div className="flex items-center gap-3 flex-1">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  aria-label="Save"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  aria-label="Cancel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <h3
                  className="text-lg font-semibold text-gray-800 flex-1 cursor-pointer hover:text-blue-600"
                  onClick={() => setIsEditing(true)}
                  title="Click to edit"
                >
                  {topic.title}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    aria-label="Edit topic"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600">Delete?</span>
                      <button
                        onClick={handleDelete}
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      aria-label="Delete topic"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right side: Stats */}
          {!isEditing && (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{solvedQuestions}</span>
                <span className="text-gray-400"> / </span>
                <span className="font-medium">{totalQuestions}</span>
                <span className="text-gray-400 ml-1">solved</span>
              </div>
              <div className="text-sm text-gray-500">
                {topic.subTopics.length} sub-topic{topic.subTopics.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {!isEditing && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  progressPercentage === 100
                    ? "bg-green-500"
                    : progressPercentage > 0
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {progressPercentage.toFixed(0)}% complete
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content: Sub-topics with Drag & Drop */}
      {isExpanded && (
        <div className="p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">Sub-topics</h4>
            <button
              onClick={() => {
                const title = prompt("Enter sub-topic name:");
                if (title && title.trim()) {
                  addSubTopic(topic.id, title.trim());
                }
              }}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Sub-topic
            </button>
          </div>
          {topic.subTopics.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No sub-topics in this topic
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSubTopicDragEnd}
            >
              <SortableContext
                items={topic.subTopics.map((st) => st.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {topic.subTopics.map((subTopic) => (
                    <SubTopicBlock
                      key={subTopic.id}
                      subTopic={subTopic}
                      topicId={topic.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
}

export default TopicCard;