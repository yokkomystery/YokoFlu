'use client';

import React from 'react';

interface FirebaseProject {
  projectId: string;
  displayName: string;
  projectNumber: string;
  state: string;
}

interface Props {
  isOpen: boolean;
  isLoading: boolean;
  projects: FirebaseProject[];
  onClose: () => void;
  onReload: () => void;
  onPick: (project: FirebaseProject) => void;
}

const ProjectSelectorModal: React.FC<Props> = ({ isOpen, isLoading, projects, onClose, onReload, onPick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Firebaseプロジェクトを選択</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">プロジェクト一覧を読み込み中...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">利用可能なプロジェクトが見つかりません</p>
            <button onClick={onReload} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">再試行</button>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.projectId}
                className="border border-gray-600 rounded p-3 hover:bg-gray-700 cursor-pointer"
                onClick={() => onPick(project)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-white">{project.displayName}</div>
                    <div className="text-sm text-gray-400">{project.projectId}</div>
                  </div>
                  <div className="text-xs text-gray-500">{project.state}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSelectorModal;

