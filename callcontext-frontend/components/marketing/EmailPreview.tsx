"use client";

import { Mail, Inbox } from "lucide-react";

interface Props {
  subject: string;
  content: string;
  fromName: string;
}

export function EmailPreview({ subject, content, fromName }: Props) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const previewText = content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 100);

  return (
    <div className="space-y-4">
      {/* Mock Email Client */}
      <div className="border border-warm-300 rounded-lg overflow-hidden shadow-lg bg-white">
        {/* Email Client Header */}
        <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Email Preview</span>
        </div>

        {/* Inbox View Preview (collapsed) */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {fromName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {fromName}
                </p>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {currentDate}
                </span>
              </div>
              <p className="text-sm text-gray-900 truncate mt-0.5">
                {subject || "(No subject)"}
              </p>
              <p className="text-sm text-gray-500 truncate mt-0.5">
                {previewText || "Email content..."}
              </p>
            </div>
            <Inbox className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        </div>

        {/* Expanded Email View */}
        <div className="bg-white">
          {/* Email Header */}
          <div className="border-b border-gray-200 px-6 py-4 space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {subject || "(No subject)"}
            </h2>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {fromName.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{fromName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      &lt;noreply@callcontext.ai&gt;
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{currentDate}</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  to: <span className="text-gray-900">customer@example.com</span>
                </p>
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="px-6 py-6 max-h-[500px] overflow-y-auto">
            {content ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  Your email content will appear here...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Client Info */}
      <div className="text-center">
        <p className="text-xs text-warm-500">
          This is a preview of how your email might appear to recipients
        </p>
        <p className="text-xs text-warm-500 mt-1">
          Actual rendering may vary by email client
        </p>
      </div>
    </div>
  );
}
