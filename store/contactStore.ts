import { create } from 'zustand';
import { Contact } from '@/types';

interface ContactStore {
  contacts: Contact[];
  addContact: (contact: Contact) => void;
  removeContact: (contactId: string) => void;
  updateContact: (contactId: string, updates: Partial<Contact>) => void;
}

export const useContactStore = create<ContactStore>((set) => ({
  contacts: [],
  addContact: (contact) =>
    set((state) => ({ contacts: [...state.contacts, contact] })),
  removeContact: (contactId) =>
    set((state) => ({
      contacts: state.contacts.filter((contact) => contact.id !== contactId),
    })),
  updateContact: (contactId, updates) =>
    set((state) => ({
      contacts: state.contacts.map((contact) =>
        contact.id === contactId ? { ...contact, ...updates } : contact
      ),
    })),
}));