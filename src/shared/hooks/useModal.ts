import { useState, useCallback } from 'react';

export type ModalMode = 'add' | 'edit' | 'view';

export const useModal = <T = any>() => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>('add');
  const [activeItem, setActiveItem] = useState<T | null>(null);

  const openAdd = useCallback(() => {
    setMode('add');
    setActiveItem(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setMode('edit');
    setActiveItem(item);
    setIsOpen(true);
  }, []);

  const openView = useCallback((item: T) => {
    setMode('view');
    setActiveItem(item);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveItem(null);
  }, []);

  return {
    isOpen,
    mode,
    activeItem,
    setActiveItem,
    openAdd,
    openEdit,
    openView,
    close,
  };
};
