'use client';

import React from 'react';
import { APP_TEMPLATE_OPTIONS, AppTemplateId } from '../config/templateOptions';
import { useLocale } from '../context/LocaleContext';

interface Props {
  selectedTemplate: AppTemplateId;
  onSelect: (id: AppTemplateId) => void;
}

const TemplateSelector: React.FC<Props> = ({ selectedTemplate, onSelect }) => {
  const { t } = useLocale();

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-6">
      <h2 className="text-xl font-semibold mb-4">{t.form.template.title}</h2>
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 mb-4">
        <p className="text-sm text-gray-300 mb-2">
          <strong>{t.templateSelector.aboutTemplates}</strong>
        </p>
        <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
          <li>{t.form.template.description}</li>
          <li>{t.templateSelector.readyToRun}</li>
          <li>{t.templateSelector.fullyCustomizable}</li>
        </ul>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {APP_TEMPLATE_OPTIONS.map((template) => {
          const templateData = t.templates[template.id];
          return (
            <div
              key={template.id}
              onClick={() => onSelect(template.id)}
              className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105 ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-gray-600 bg-gray-900/40'
              }`}
            >
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              <div className="text-4xl mb-2">{template.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {templateData.label}
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                {templateData.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {templateData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-700 px-2 py-1 rounded-full text-gray-300"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              {template.id === 'chat' && (
                <div className="mt-2 text-xs text-yellow-400 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t.templateSelector.firebaseRequired}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateSelector;
