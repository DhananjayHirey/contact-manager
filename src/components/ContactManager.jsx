import React, { useState, useCallback } from 'react';
import { User, Phone, Search, Plus, Trash2 } from 'lucide-react';

// BST Node class
class BSTNode {
  constructor(name, phone) {
    this.name = name;
    this.phone = phone;
    this.left = null;
    this.right = null;
  }
}

// Binary Search Tree class
class BST {
  constructor() {
    this.root = null;
  }

  insert(name, phone) {
    const newNode = new BSTNode(name.toLowerCase(), phone);
    
    if (this.root === null) {
      this.root = newNode;
    } else {
      this.insertNode(this.root, newNode);
    }
  }

  insertNode(node, newNode) {
    if (newNode.name < node.name) {
      if (node.left === null) {
        node.left = newNode;
      } else {
        this.insertNode(node.left, newNode);
      }
    } else {
      if (node.right === null) {
        node.right = newNode;
      } else {
        this.insertNode(node.right, newNode);
      }
    }
  }

  search(name) {
    return this.searchNode(this.root, name.toLowerCase());
  }

  searchNode(node, name) {
    if (node === null) {
      return null;
    }

    if (name === node.name) {
      return { name: node.name, phone: node.phone };
    }

    if (name < node.name) {
      return this.searchNode(node.left, name);
    } else {
      return this.searchNode(node.right, name);
    }
  }

  searchPartial(partialName) {
    const results = [];
    this.searchPartialNode(this.root, partialName.toLowerCase(), results);
    return results;
  }

  searchPartialNode(node, partialName, results) {
    if (node === null) return;

    if (node.name.includes(partialName)) {
      results.push({ name: node.name, phone: node.phone });
    }

    this.searchPartialNode(node.left, partialName, results);
    this.searchPartialNode(node.right, partialName, results);
  }

  getAllContacts() {
    const contacts = [];
    this.inOrderTraversal(this.root, contacts);
    return contacts;
  }

  inOrderTraversal(node, contacts) {
    if (node !== null) {
      this.inOrderTraversal(node.left, contacts);
      contacts.push({ name: node.name, phone: node.phone });
      this.inOrderTraversal(node.right, contacts);
    }
  }

  delete(name) {
    this.root = this.deleteNode(this.root, name.toLowerCase());
  }

  deleteNode(node, name) {
    if (node === null) return null;

    if (name < node.name) {
      node.left = this.deleteNode(node.left, name);
    } else if (name > node.name) {
      node.right = this.deleteNode(node.right, name);
    } else {
      // Node to be deleted found
      if (node.left === null && node.right === null) {
        return null;
      }
      if (node.left === null) {
        return node.right;
      }
      if (node.right === null) {
        return node.left;
      }

      // Node has two children
      const minRight = this.findMin(node.right);
      node.name = minRight.name;
      node.phone = minRight.phone;
      node.right = this.deleteNode(node.right, minRight.name);
    }
    return node;
  }

  findMin(node) {
    while (node.left !== null) {
      node = node.left;
    }
    return node;
  }
}

export default function ContactManager() {
  const [bst] = useState(() => {
    const tree = new BST();
    // Add some sample data
    tree.insert('John Doe', '+1-555-0123');
    tree.insert('Alice Smith', '+1-555-0456');
    tree.insert('Bob Johnson', '+1-555-0789');
    tree.insert('Carol Brown', '+1-555-0321');
    tree.insert('David Wilson', '+1-555-0654');
    return tree;
  });

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allContacts, setAllContacts] = useState(() => bst.getAllContacts());
  const [message, setMessage] = useState('');

  const handleAddContact = useCallback(() => {
    if (!newName.trim() || !newPhone.trim()) {
      setMessage('Please fill in both name and phone number');
      return;
    }

    // Check if contact already exists
    if (bst.search(newName)) {
      setMessage('Contact with this name already exists');
      return;
    }

    bst.insert(newName, newPhone);
    setAllContacts(bst.getAllContacts());
    setNewName('');
    setNewPhone('');
    setMessage(`Contact "${newName}" added successfully!`);
  }, [newName, newPhone, bst]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const results = bst.searchPartial(searchQuery);
    setSearchResults(results);
    
    if (results.length === 0) {
      setMessage('No contacts found matching your search');
    } else {
      setMessage(`Found ${results.length} contact(s)`);
    }
  }, [searchQuery, bst]);

  const handleDeleteContact = useCallback((name) => {
    bst.delete(name);
    setAllContacts(bst.getAllContacts());
    setSearchResults(bst.searchPartial(searchQuery));
    setMessage(`Contact "${name}" deleted successfully!`);
  }, [bst, searchQuery]);

  const formatName = (name) => {
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const ContactCard = ({ contact, showDelete = false }) => (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{formatName(contact.name)}</h3>
            <div className="flex items-center space-x-1 text-gray-600">
              <Phone className="w-4 h-4" />
              <span className="text-sm">{contact.phone}</span>
            </div>
          </div>
        </div>
        {showDelete && (
          <button
            onClick={() => handleDeleteContact(contact.name)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            title="Delete contact"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Contact Manager</h1>
          <p className="text-gray-600">Efficient contact storage using Binary Search Tree</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Contact Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Plus className="w-6 h-6 mr-2 text-blue-600" />
              Add New Contact
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter contact name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleAddContact}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Add Contact
              </button>
            </div>
          </div>

          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Search className="w-6 h-6 mr-2 text-green-600" />
              Search Contacts
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search by Name
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type name to search..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">Search Results:</h3>
                  {searchResults.map((contact, index) => (
                    <ContactCard key={index} contact={contact} showDelete={true} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Contacts Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            All Contacts ({allContacts.length})
          </h2>
          
          {allContacts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No contacts found. Add some contacts to get started!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allContacts.map((contact, index) => (
                <ContactCard key={index} contact={contact} showDelete={true} />
              ))}
            </div>
          )}
        </div>

        {/* BST Info */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">How it works:</h3>
          <p className="text-gray-600 text-sm">
            This contact manager uses a Binary Search Tree (BST) for efficient storage and retrieval. 
            Contacts are stored alphabetically by name, allowing for fast O(log n) search times. 
            The search function supports partial name matching and returns all matching contacts.
          </p>
        </div>
      </div>
    </div>
  );
}