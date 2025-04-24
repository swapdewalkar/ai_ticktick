'use client';

import { useTasks } from '@/contexts/TaskContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FiInbox, FiCalendar, FiList, FiPlus } from 'react-icons/fi';

export default function Sidebar() {
  const { lists, addList } = useTasks();
  const [newListName, setNewListName] = useState('');
  const [isAddingList, setIsAddingList] = useState(false);
  const pathname = usePathname();

  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      await addList(newListName.trim());
      setNewListName('');
      setIsAddingList(false);
    }
  };

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col h-full">
      <nav className="flex-1 space-y-1">
        <Link
          href="/dashboard"
          className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
            pathname === '/dashboard'
              ? 'bg-gray-900 text-white'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
        >
          <FiCalendar className="mr-3 h-5 w-5" />
          Dashboard
        </Link>
        
        <div className="pt-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Lists
            </h3>
            <button
              onClick={() => setIsAddingList(!isAddingList)}
              className="text-gray-400 hover:text-white"
            >
              <FiPlus className="h-5 w-5" />
            </button>
          </div>
          
          {isAddingList && (
            <form onSubmit={handleAddList} className="mb-2 px-2">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="List name"
                  className="flex-1 px-2 py-1 text-sm text-gray-900 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="ml-2 p-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <FiPlus className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}
          
          <div className="space-y-1">
            {lists.map((list) => (
              <Link
                key={list.id}
                href={`/lists/${list.id}`}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  pathname === `/lists/${list.id}`
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <FiList className="mr-3 h-5 w-5" />
                {list.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}
