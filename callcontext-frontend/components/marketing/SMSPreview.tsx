"use client";

interface Props {
  message: string;
  fromName: string;
}

export function SMSPreview({ message, fromName }: Props) {
  const charCount = message.length;
  const segments = Math.ceil(charCount / 160);

  return (
    <div className="space-y-4">
      {/* Mock iPhone screen */}
      <div className="mx-auto w-full max-w-[375px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-3 shadow-2xl">
        <div className="bg-white rounded-[2rem] h-[600px] overflow-hidden flex flex-col">
          {/* Status bar */}
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between text-xs">
            <span className="font-semibold">9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 border border-gray-900 rounded-sm relative">
                <div className="absolute inset-0.5 bg-gray-900 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
                {fromName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{fromName}</p>
                <p className="text-xs text-gray-500">Text Message</p>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 bg-white px-4 py-6 overflow-y-auto">
            <div className="flex flex-col items-start">
              {message ? (
                <div className="max-w-[85%]">
                  <div className="bg-gray-200 text-gray-900 rounded-[18px] rounded-tl-sm px-4 py-2.5 shadow-sm">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {message}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-2">Now</p>
                </div>
              ) : (
                <div className="text-gray-400 italic text-sm">
                  Your message will appear here...
                </div>
              )}
            </div>
          </div>

          {/* Input area */}
          <div className="bg-gray-50 px-2 py-2 border-t border-gray-200">
            <div className="bg-white border border-gray-300 rounded-full px-4 py-2 flex items-center">
              <span className="text-sm text-gray-400">iMessage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Character count */}
      <div className="text-center space-y-1">
        <p className="text-sm text-warm-700">
          <span className="font-medium">{charCount}</span> characters
          {segments > 1 && (
            <span className="text-warm-500 ml-2">({segments} messages)</span>
          )}
        </p>
        {charCount > 160 && (
          <p className="text-xs text-amber-600">
            Messages over 160 characters will be split into multiple SMS
          </p>
        )}
        {charCount > 500 && (
          <p className="text-xs text-red-600 font-medium">
            Message exceeds recommended limit (500 characters)
          </p>
        )}
      </div>
    </div>
  );
}
