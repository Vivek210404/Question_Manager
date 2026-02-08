import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import useSheetStore from "../../store/sheetStore";

function QuestionRow({ question, topicId, subTopicId }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editData, setEditData] = useState({
    title: question.title,
    link: question.link,
    difficulty: question.difficulty,
    platform: question.platform,
  });

  const { toggleQuestionSolved, updateQuestion, deleteQuestion } = useSheetStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const difficultyColors = {
    Easy: "bg-green-100 text-green-800 border-green-300",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Hard: "bg-red-100 text-red-800 border-red-300",
  };

  const difficultyColor =
    difficultyColors[question.difficulty] ||
    "bg-gray-100 text-gray-800 border-gray-300";

  const platformColors = {
    LeetCode: "text-orange-600",
    Codeforces: "text-blue-600",
    HackerRank: "text-green-600",
    AtCoder: "text-gray-700",
    Unknown: "text-gray-500",
  };

  const platformColor =
    platformColors[question.platform] || platformColors.Unknown;

  const handleSave = () => {
    updateQuestion(topicId, subTopicId, question.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: question.title,
      link: question.link,
      difficulty: question.difficulty,
      platform: question.platform,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteQuestion(topicId, subTopicId, question.id);
    setShowDeleteConfirm(false);
  };

  if (isEditing) {
    return (
      <div className="p-3 rounded-lg border-2 border-blue-300 bg-blue-50">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Question Title"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Question URL"
            value={editData.link}
            onChange={(e) => setEditData({ ...editData, link: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <select
              value={editData.difficulty}
              onChange={(e) => setEditData({ ...editData, difficulty: e.target.value })}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <input
              type="text"
              placeholder="Platform"
              value={editData.platform}
              onChange={(e) => setEditData({ ...editData, platform: e.target.value })}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        question.solved
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-200 hover:border-gray-300"
      } ${isDragging ? "ring-2 ring-blue-500" : ""}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      {/* Solved Checkbox */}
      <input
        type="checkbox"
        checked={question.solved}
        onChange={() => toggleQuestionSolved(topicId, subTopicId, question.id)}
        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
      />

      {/* Question Title */}
      <div className="flex-1 min-w-0">
        {question.link ? (
          <a
            href={question.link}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-900 hover:text-blue-600 hover:underline truncate block"
          >
            {question.title}
          </a>
        ) : (
          <span className="font-medium text-gray-900">{question.title}</span>
        )}
      </div>

      {/* Difficulty Badge */}
      <span
        className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${difficultyColor}`}
      >
        {question.difficulty}
      </span>

      {/* Platform */}
      <span className={`text-sm font-medium ${platformColor}`}>
        {question.platform}
      </span>

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          aria-label="Edit question"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        {showDeleteConfirm ? (
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              className="px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              Yes
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            aria-label="Delete question"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* External Link Icon */}
      {question.link && (
        <a
          href={question.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-600 transition-colors"
          aria-label="Open in new tab"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      )}
    </div>
  );
}

export default QuestionRow;