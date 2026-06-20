import { APP_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. Built for Kenyan property managers.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-700">Help</a>
          <a href="#" className="hover:text-gray-700">Privacy</a>
          <a href="#" className="hover:text-gray-700">Terms</a>
        </div>
      </div>
    </footer>
  );
}
