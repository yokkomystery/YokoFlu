'use client';

import React from 'react';
import {
  LOCALIZATION_LANGUAGE_OPTIONS,
  LocalizationLanguageId,
} from '../config/templateOptions';
import { useLocale } from '../context/LocaleContext';

interface Props {
  selected: LocalizationLanguageId[];
  onChange: (next: LocalizationLanguageId[]) => void;
  error?: string;
}

const LocalizationSelector: React.FC<Props> = ({
  selected,
  onChange,
  error,
}) => {
  const { t, locale } = useLocale();
  const handleToggle = (id: LocalizationLanguageId, checked: boolean) => {
    const current = selected ?? [];
    if (checked) {
      onChange(Array.from(new Set([...current, id])));
    } else {
      onChange(current.filter((x) => x !== id));
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg mb-6">
      <p className="text-sm text-gray-300 mb-2">{t.localization.title}</p>
      <div className="bg-gray-900/50 border border-gray-700 rounded px-3 py-2 mb-3">
        <p className="text-xs text-gray-400 mb-1">
          {t.localization.description}
        </p>
        <p className="text-xs text-gray-500">💡 {t.localization.autoChange}</p>
      </div>
      <p className="text-xs text-yellow-400 mb-3">
        ⚠️ <strong>{t.common2.required}</strong>: {t.localization.requirement}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {LOCALIZATION_LANGUAGE_OPTIONS.map((language) => {
          const isChecked = selected?.includes(language.id) ?? false;
          const isJaOrEn = language.id === 'ja' || language.id === 'en';
          const selectedJaOrEn =
            selected?.filter((id) => id === 'ja' || id === 'en') ?? [];
          const isDisabled =
            isJaOrEn && selectedJaOrEn.length === 1 && isChecked;
          const langData = t.languageOptions[language.id];

          return (
            <label
              key={language.id}
              className="flex items-start space-x-3 bg-gray-900/40 border border-gray-700 rounded-lg p-3"
            >
              <input
                type="checkbox"
                value={language.id}
                checked={isChecked}
                disabled={isDisabled}
                onChange={(e) => handleToggle(language.id, e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div>
                <div className="text-sm font-medium text-white flex items-center gap-2">
                  {langData.label}
                  {isDisabled && (
                    <span className="text-xs text-yellow-400">
                      ({t.common2.required})
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{langData.description}</p>
              </div>
            </label>
          );
        })}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default LocalizationSelector;
