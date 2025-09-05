// src/components/Step6TemplateSelector.jsx
import React from 'react';
import TemplateModern from './templates/TemplateModern';
import TemplateBasic from './templates/TemplateBasic';
import TemplateImageFocus from './templates/TemplateImageFocus';
import TemplateTextHeavy from './templates/TemplateTextHeavy';

const templates = [
  { id: 'modern', label: '모던 템플릿', component: TemplateModern },
  { id: 'basic', label: '베이직 템플릿', component: TemplateBasic },
  { id: 'image', label: '이미지 중심', component: TemplateImageFocus },
  { id: 'text', label: '텍스트 중심', component: TemplateTextHeavy },
];

export default function Step6TemplateSelector({
  selectedTemplate, setSelectedTemplate,
  modelImageUrl, fittedImageUrl, detailImages, multiFittedImages, generatedVideoUrl,
  title, shortDesc, imgDescs, longDesc
}) {
  const renderSelectedTemplate = () => {
    const Template = templates.find(t => t.id === selectedTemplate)?.component;
    return Template ? (
      <div className="mt-8">
        <Template
            modelImageUrl={modelImageUrl}
            fittedImageUrl={fittedImageUrl}
            detailImages={detailImages}
            multiFittedImages={multiFittedImages}
            generatedVideoUrl={generatedVideoUrl}
            title={title}
            shortDesc={shortDesc}
            imgDescs={imgDescs}
            longDesc={longDesc}
        />
      </div>
    ) : null;
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow border mt-10">
      <h2 className="text-2xl font-bold text-pink-500 text-center mb-4">STEP 6. 상세페이지 템플릿 선택</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`border p-3 rounded-md transition ${
              selectedTemplate === template.id ? 'bg-pink-100 border-pink-400' : 'hover:shadow'
            }`}
          >
            {template.label}
          </button>
        ))}
      </div>
      {renderSelectedTemplate()}
    </section>
  );
}
