interface AiClassificationCardProps {
  aiMetadata?: {
    category: string;
    confidence: number;
    suggestedPriority: string;
    suggestedSeverity: string;
    sentimentScore?: number;
    tags?: string[];
  };
  sentimentScore?: number;
  isStaffView?: boolean;
}

export function AiClassificationCard({ 
  aiMetadata, 
  sentimentScore, 
  isStaffView = false 
}: AiClassificationCardProps) {
  if (!aiMetadata && sentimentScore === undefined) return null;

  const getSentimentLabel = (score?: number) => {
    if (score === undefined) return null;
    if (score >= 0.7) return { label: "Positive", color: "text-green-600" };
    if (score >= 0.4) return { label: "Neutral", color: "text-gray-600" };
    return { label: "Negative", color: "text-red-600" };
  };

  const sentiment = getSentimentLabel(sentimentScore);
  const confidence = aiMetadata?.confidence ? Math.round(aiMetadata.confidence * 100) : null;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-xs font-medium text-blue-700">AI</span>
        </div>
        <h3 className="text-sm font-medium text-blue-900">
          {isStaffView ? "AI Analysis" : "AI Classification"}
        </h3>
        {confidence && (
          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
            {confidence}% confidence
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        {aiMetadata?.category && (
          <div>
            <p className="text-xs text-blue-600 font-medium">Category</p>
            <p className="text-blue-900">{aiMetadata.category}</p>
          </div>
        )}
        
        {isStaffView && aiMetadata?.suggestedPriority && (
          <div>
            <p className="text-xs text-blue-600 font-medium">Suggested Priority</p>
            <p className="text-blue-900">{aiMetadata.suggestedPriority}</p>
          </div>
        )}
        
        {isStaffView && aiMetadata?.suggestedSeverity && (
          <div>
            <p className="text-xs text-blue-600 font-medium">Suggested Severity</p>
            <p className="text-blue-900">{aiMetadata.suggestedSeverity}</p>
          </div>
        )}
        
        {sentiment && (
          <div>
            <p className="text-xs text-blue-600 font-medium">Sentiment</p>
            <p className={`${sentiment.color} font-medium`}>{sentiment.label}</p>
          </div>
        )}
      </div>
      
      {isStaffView && aiMetadata?.tags && aiMetadata.tags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-600 font-medium mb-1">Tags</p>
          <div className="flex flex-wrap gap-1">
            {aiMetadata.tags.map((tag, i) => (
              <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}