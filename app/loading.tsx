export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-200 dark:border-violet-900 rounded-full animate-ping"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-violet-600 dark:border-t-violet-400 rounded-full animate-spin"></div>
        </div>
        <div className="text-lg font-medium text-violet-600 dark:text-violet-400">
          Loading...
        </div>
      </div>
    </div>
  );
}
