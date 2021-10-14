import React, { useState, useContext, createContext } from "react";

type Context = {
  isOpen: boolean,
  open?: () => void,
  close?: () => void,
  toggle?: () => void,
}

const initialState: Context = {
  isOpen: false
};

const SidebarContext = createContext<Context>(initialState);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const sidebar = useProvideSidebar();
  return <SidebarContext.Provider value={sidebar}>{children}</SidebarContext.Provider>;
}

export const useSidebar = () => {
  return useContext(SidebarContext);
};

function useProvideSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(open => !open);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
