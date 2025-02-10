import React, { useState } from 'react';

const ITEMS_PER_PAGE = 7;

function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate pagination
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);

  return (
    <div className="admin-dashboard">
      {/* Display current page items */}
      <div className="dashboard-content">
        {currentItems.map((item) => (
          // ... existing item rendering code ...
        ))}
      </div>

      {/* Improved paginator */}
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="page-btn"
        >
          Previous
        </button>
        
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
          >
            {index + 1}
          </button>
        ))}

        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="page-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminDashboard; 