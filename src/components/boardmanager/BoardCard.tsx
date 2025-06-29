import React, { useState } from 'react';

interface BoardCardProps {
  id: string;
  title: string;
  lastEdited: Date;
  thumbnail: string;
  onOpen: (id: string) => void;
  onShare: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({
  id,
  title,
  lastEdited,
  thumbnail,
  onOpen,
  onShare,
  onDuplicate,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const formattedDate = lastEdited.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  return (
    <div 
      className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer relative"
      onClick={() => onOpen(id)}
    >
      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div 
          className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-white text-center mb-4">
            Are you sure you want to delete this board?
          </p>
          <div className="flex space-x-3">
            <button
              onClick={cancelDelete}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative">
        <img
          src={thumbnail}
          alt={`${title} thumbnail`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/400x225";
            e.currentTarget.classList.add("bg-gray-200");
          }}
        />
        <div className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity bg-black/20 flex items-center justify-center">
          <span className="bg-white px-4 py-2 rounded-md font-medium">Open</span>
        </div>
      </div>
      
      {/* Card footer */}
      <div className="p-3">
        <h3 className="font-semibold truncate">{title}</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-500">Edited {formattedDate}</span>
          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(id);
              }} 
              className="text-gray-500 hover:text-blue-500"
            >
              <DuplicateIcon />
            </button>
            <button 
              onClick={handleDeleteClick}
              className="text-gray-500 hover:text-red-500"
            >
              <DeleteIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icons remain the same as before
const DuplicateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
    <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

export default BoardCard;