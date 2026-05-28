'use client';

import React from 'react';

interface AIReportViewerProps {
  content: string;
}

export function AIReportViewer({ content }: AIReportViewerProps) {
  if (!content) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        Báo cáo này chưa có nội dung chi tiết.
      </div>
    );
  }

  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    let isInsideList = false;

    const flushList = (key: number) => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 mb-4 space-y-1.5 text-gray-700 dark:text-gray-300">
            {currentList}
          </ul>
        );
        currentList = [];
      }
      isInsideList = false;
    };

    const formatText = (text: string) => {
      // Bold **text** parser
      const parts = text.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <strong key={index} className="font-extrabold text-gray-900 dark:text-gray-100">
              {part}
            </strong>
          );
        }
        return part;
      });
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Empty line
      if (trimmed === '') {
        flushList(index);
        return;
      }

      // Headers
      if (trimmed.startsWith('# ')) {
        flushList(index);
        elements.push(
          <h1 key={index} className="text-xl font-extrabold text-gray-900 dark:text-white mt-6 mb-3 border-b border-gray-150 dark:border-gray-800 pb-2">
            {formatText(trimmed.substring(2))}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        flushList(index);
        elements.push(
          <h2 key={index} className="text-base font-extrabold text-gray-800 dark:text-gray-200 mt-5 mb-2.5">
            {formatText(trimmed.substring(3))}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushList(index);
        elements.push(
          <h3 key={index} className="text-sm font-extrabold text-gray-800 dark:text-gray-200 mt-4 mb-2">
            {formatText(trimmed.substring(4))}
          </h3>
        );
      }
      // Blockquotes
      else if (trimmed.startsWith('> ')) {
        flushList(index);
        elements.push(
          <blockquote key={index} className="border-l-4 border-amber-600 dark:border-amber-500 pl-4 py-1.5 bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 italic rounded-r mb-4 my-2 text-sm leading-relaxed">
            {formatText(trimmed.substring(2))}
          </blockquote>
        );
      }
      // Bullet list
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        isInsideList = true;
        currentList.push(
          <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
            {formatText(trimmed.substring(2))}
          </li>
        );
      }
      // Paragraph
      else {
        flushList(index);
        elements.push(
          <p key={index} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3.5">
            {formatText(trimmed)}
          </p>
        );
      }
    });

    flushList(lines.length);

    return <div className="space-y-1">{elements}</div>;
  };

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-gray-150 dark:border-gray-800 shadow-xs max-h-[500px] overflow-y-auto">
      {renderMarkdown(content)}
    </div>
  );
}
export default AIReportViewer;
