const QuickPrompt = ({ text, icon: Icon, onClick }) => (
  <button
    onClick={() => onClick(text)}
    className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 hover:shadow-md group"
  >
    {Icon && (
      <Icon
        size={16}
        className="text-blue-600 group-hover:scale-110 transition-transform"
      />
    )}
    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
      {text}
    </span>
  </button>
);

export default QuickPrompt;
