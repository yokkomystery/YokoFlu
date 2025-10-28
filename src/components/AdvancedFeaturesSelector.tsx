'use client';

import React from 'react';
import {
  ADVANCED_FEATURE_OPTIONS,
  DEFAULT_ADVANCED_FEATURE_IDS,
  AdvancedFeatureCategory,
  ADVANCED_FEATURE_CATEGORY_LABELS,
} from '../config/templateOptions';
import { useLocale } from '../context/LocaleContext';

interface Props {
  useFirebase: boolean;
  selected: string[];
  onChange: (next: string[]) => void;
}

const AdvancedFeaturesSelector: React.FC<Props> = ({ useFirebase, selected, onChange }) => {
  const { t, locale } = useLocale();
  const toggle = (id: string, checked: boolean) => {
    const current = selected ?? [];
    if (checked) {
      onChange(Array.from(new Set([...current, id])));
    } else {
      onChange(current.filter((x) => x !== id));
    }
  };

  const categories: AdvancedFeatureCategory[] = ['app-management', 'auth', 'analytics', 'ui-ux'];

  return (
    <div>
      <div className="bg-blue-900/20 border border-blue-700 text-blue-200 px-4 py-3 rounded text-sm mb-4">
        <p className="font-medium mb-2">{t.advancedFeatures.about}</p>
        <ul className="text-xs space-y-1 list-disc list-inside">
          {t.advancedFeatures.description.map((desc, index) => (
            <li key={index}>{desc}</li>
          ))}
        </ul>
      </div>

      {categories.map((category) => {
        const featuresInCategory = ADVANCED_FEATURE_OPTIONS.filter((f) => f.category === category);
        return (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-medium text-blue-300 mb-3">
              {ADVANCED_FEATURE_CATEGORY_LABELS[category]}
            </h3>
            <div className="space-y-2">
              {featuresInCategory.map((feature) => {
                const isDisabled = feature.requiresFirebase && !useFirebase;
                const checked = selected?.includes(feature.id) ?? DEFAULT_ADVANCED_FEATURE_IDS.includes(feature.id);
                return (
                  <label
                    key={feature.id}
                    className={`flex items-start space-x-3 bg-gray-900/40 border rounded-lg p-3 ${
                      isDisabled ? 'border-gray-700 opacity-60' : 'border-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={feature.id}
                      checked={checked}
                      disabled={isDisabled}
                      onChange={(e) => toggle(feature.id, e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{feature.label}</span>
                        {feature.requiresFirebase && (
                          <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-0.5 rounded-full">
                            {locale === 'ja' ? 'Firebase必須' : 'Firebase Required'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{feature.description}</p>
                      {feature.todoNote && (
                        <p className="text-xs text-blue-300 flex items-start gap-1">
                          <span>📝</span>
                          <span>{feature.todoNote}</span>
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdvancedFeaturesSelector;

