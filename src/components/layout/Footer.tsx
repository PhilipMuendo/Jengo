import { APP_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-3">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-gray-400 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}</p>
        <div className="flex gap-4">
          <a href="#" className="transition-colors hover:text-gray-600">Help</a>
          <a href="#" className="transition-colors hover:text-gray-600">Privacy</a>
          <a href="#" className="transition-colors hover:text-gray-600">Terms</a>
        </div>
      </div>
    </footer>
  );
}
