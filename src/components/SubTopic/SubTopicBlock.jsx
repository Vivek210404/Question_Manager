import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import QuestionRow from "../Question/QuestionRow";
import useSheetStore from "../../store/sheetStore";

function SubTopicBlock({ subTopic, topicId }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subTopic.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { updateSubTopic, deleteSubTopic, addQuestion, reorderSubTopics, reorderQuestions } = useSheetStore();

  const {
    attributes: subTopicAttributes,
    listeners: subTopicListeners,
    setNodeRef: setSubTopicNodeRef,
    transform: subTopicTransform,
    transition: subTopicTransition,
    isDragging: isSubTopicDragging,
  } = useSortable({ id: subTopic.id });

  const subTopicStyle = {
    transform: CSS.Transform.toString(subTopicTransform),
    transition: subTopicTransition,
    opacity: isSubTopicDragging ? 0.5 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const solvedCount = subTopic.questions.filter((q) => q.solved).length;
  const totalCount = subTopic.questions.length;
  const progressPercentage =
    totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  const handleSaveTitle = () => {
    if (editTitle.trim()) {
      updateSubTopic(topicId, subTopic.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(subTopic.title);
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteSubTopic(topicId, subTopic.id);
    setShowDeleteConfirm(false);
  };

  const handleQuestionDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = subTopic.questions.findIndex((q) => q.id === active.id);
      const newIndex = subTopic.questions.findIndex((q) => q.id === over.id);
      reorderQuestions(topicId, subTopic.id, oldIndex, newIndex);
    }
  };

  return (
    <div
      ref={setSubTopicNodeRef}
      style={subTopicStyle}
      className={`mb-3 border border-gray-200 rounded-lg overflow-hidden bg-white ${
        isSubTopicDragging ? "ring-2 ring-blue-500" : ""
      }`}
    >
      {/* SubTopic Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Left side: Drag Handle + Expand/Collapse + Title */}
          <div className="flex items-center gap-2 flex-1">
            {/* Drag Handle for SubTopic */}
            <div
              {...subTopicAttributes}
              {...subTopicListeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${
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
                  className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                  aria-label="Save"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  aria-label="Cancel"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <h4
                  className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
                  onClick={() => setIsEditing(true)}
                  title="Click to edit"
                >
                  {subTopic.title}
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    aria-label="Edit sub-topic"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleDelete}
                        className="px-1.5 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      aria-label="Delete sub-topic"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{solvedCount}</span>
                <span className="text-gray-400"> / </span>
                <span className="font-medium">{totalCount}</span>
              </div>
              <div className="w-20 bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    progressPercentage === 100
                      ? "bg-green-500"
                      : progressPercentage > 0
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Questions List with Drag & Drop */}
      {isExpanded && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleQuestionDragEnd}
        >
          <div className="p-3 space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Questions</span>
              <button
                onClick={() => {
                  const title = prompt("Enter question title:");
                  if (title && title.trim()) {
                    const link = prompt("Enter question URL (optional):");
                    const difficulty = prompt("Enter difficulty (Easy/Medium/Hard):", "Easy");
                    const platform = prompt("Enter platform (LeetCode/Codeforces/etc):", "Unknown");
                    
                    addQuestion(topicId, subTopic.id, {
                      title: title.trim(),
                      link: link || "",
                      difficulty: difficulty || "Easy",
                      platform: platform || "Unknown",
                      solved: false,
                    });
                  }
                }}
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </button>
            </div>
            {subTopic.questions.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                No questions in this sub-topic
              </div>
            ) : (
              <SortableContext
                items={subTopic.questions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                {subTopic.questions.map((question) => (
                  <QuestionRow
                    key={question.id}
                    question={question}
                    topicId={topicId}
                    subTopicId={subTopic.id}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        </DndContext>
      )}
    </div>
  );
}

export default SubTopicBlock;