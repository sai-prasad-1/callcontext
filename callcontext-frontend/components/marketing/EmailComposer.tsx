"use client";

import { useState } from "react";
import { BookTemplate, FileText, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EMAIL_TEMPLATES } from "@/lib/constants/email-templates";

interface EmailData {
  subject: string;
  content: string;
}

interface Props {
  value: EmailData;
  onChange: (data: EmailData) => void;
  shopName: string;
}

type TemplateKey = keyof typeof EMAIL_TEMPLATES;

export function EmailComposer({ value, onChange, shopName }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey | "custom">("custom");
  const [showPreview, setShowPreview] = useState(false);

  const handleTemplateSelect = (templateKey: TemplateKey | "custom") => {
    setSelectedTemplate(templateKey);
    if (templateKey !== "custom") {
      const template = EMAIL_TEMPLATES[templateKey];
      onChange({
        subject: template.subject,
        content: template.html,
      });
    }
  };

  const insertToken = (field: "subject" | "content", token: string) => {
    if (field === "subject") {
      const input = document.getElementById("email-subject") as HTMLInputElement;
      if (input) {
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const text = value.subject;
        const before = text.substring(0, start);
        const after = text.substring(end);
        const newText = before + token + after;
        onChange({ ...value, subject: newText });
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(start + token.length, start + token.length);
        }, 0);
      }
    } else {
      const textarea = document.getElementById("email-content") as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const text = value.content;
        const before = text.substring(0, start);
        const after = text.substring(end);
        const newText = before + token + after;
        onChange({ ...value, content: newText });
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + token.length, start + token.length);
        }, 0);
      }
    }
  };

  const wordCount = value.content.split(/\s+/).filter((word) => word.length > 0).length;
  const charCount = value.content.length;

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <div>
        <label className="block text-sm font-medium text-warm-700 mb-2">
          <BookTemplate className="inline-block w-4 h-4 mr-1" />
          Email Template
        </label>
        <select
          className="w-full px-4 py-2 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          value={selectedTemplate}
          onChange={(e) => handleTemplateSelect(e.target.value as TemplateKey | "custom")}
        >
          <option value="custom">Custom Email</option>
          {Object.entries(EMAIL_TEMPLATES).map(([key, template]) => (
            <option key={key} value={key}>
              {template.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-warm-500 mt-1">
          Choose a pre-designed template or create a custom email
        </p>
      </div>

      {/* Subject Line */}
      <div>
        <label className="block text-sm font-medium text-warm-700 mb-2">
          Email Subject
        </label>
        <input
          id="email-subject"
          type="text"
          className="w-full px-4 py-3 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Enter email subject..."
          value={value.subject}
          onChange={(e) => onChange({ ...value, subject: e.target.value })}
        />
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => insertToken("subject", "{{first_name}}")}
            >
              + First Name
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => insertToken("subject", "{{last_name}}")}
            >
              + Last Name
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => insertToken("subject", "{{shop_name}}")}
            >
              + Shop Name
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => insertToken("subject", "{{month}}")}
            >
              + Month
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => insertToken("subject", "{{year}}")}
            >
              + Year
            </Button>
          </div>
          <p className="text-xs text-warm-500">{value.subject.length} characters</p>
        </div>
      </div>

      {/* Email Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-warm-700">
            <FileText className="inline-block w-4 h-4 mr-1" />
            Email Content (HTML)
          </label>
          <Button
            variant="ghost"
            size="sm"
            icon={showPreview ? EyeOff : Eye}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Edit" : "Preview"}
          </Button>
        </div>

        {showPreview ? (
          <div className="border border-warm-300 rounded-lg p-4 bg-white min-h-[400px] max-h-[600px] overflow-auto">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: value.content }}
            />
          </div>
        ) : (
          <>
            <textarea
              id="email-content"
              className="w-full h-[400px] px-4 py-3 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none font-mono text-sm"
              placeholder="Enter your email content (HTML supported)..."
              value={value.content}
              onChange={(e) => onChange({ ...value, content: e.target.value })}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => insertToken("content", "{{first_name}}")}
                >
                  + First Name
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => insertToken("content", "{{last_name}}")}
                >
                  + Last Name
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => insertToken("content", "{{shop_name}}")}
                >
                  + Shop Name
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => insertToken("content", "{{month}}")}
                >
                  + Month
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => insertToken("content", "{{year}}")}
                >
                  + Year
                </Button>
              </div>
              <div className="text-xs text-warm-500 space-x-3">
                <span>{wordCount} words</span>
                <span>{charCount.toLocaleString()} characters</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tips */}
      <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
        <p className="text-sm text-brand-900 font-medium mb-2">Email Tips:</p>
        <ul className="text-xs text-brand-700 space-y-1 list-disc list-inside">
          <li>Use inline CSS for styling (external stylesheets may not work)</li>
          <li>Keep subject lines under 50 characters for mobile visibility</li>
          <li>Personalize with tokens like {"{{"} first_name {"}}"} for better engagement</li>
          <li>Test your email on different devices and clients</li>
          <li>Include a clear call-to-action button</li>
        </ul>
      </div>
    </div>
  );
}
