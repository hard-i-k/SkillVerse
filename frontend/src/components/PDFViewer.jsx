import React, { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { FiZoomIn, FiZoomOut, FiDownload, FiRotateCw } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const PDFViewer = ({ url }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Auto-adjust scale based on screen size
  useEffect(() => {
    const adjustScale = () => {
      const width = window.innerWidth;
      if (width < 640) { // mobile
        setScale(0.8);
      } else if (width < 1024) { // tablet
        setScale(1.0);
      } else { // desktop
        setScale(1.2);
      }
    };

    adjustScale();
    window.addEventListener('resize', adjustScale);
    return () => window.removeEventListener('resize', adjustScale);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setError(true);
    setLoading(false);
  };

  const goToPrevPage = () => setPageNumber(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setPageNumber(prev => Math.min(numPages, prev + 1));
  
  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setScale(1.0);
  
  const rotateClockwise = () => setRotation(prev => (prev + 90) % 360);
  const resetRotation = () => setRotation(0);

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.pdf';
    link.click();
  };

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 rounded-xl ${
        isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
      }`}>
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-lg font-semibold mb-2">Failed to load PDF</h3>
        <p className="text-sm text-center mb-4">The PDF file could not be loaded. Please try again later.</p>
        <button
          onClick={() => window.location.reload()}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`w-full ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
      {/* Controls Bar */}
      <div className={`p-4 border-b ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={goToPrevPage} 
              disabled={pageNumber <= 1}
              className={`p-2 rounded-lg transition-colors ${
                pageNumber <= 1
                  ? (isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed')
                  : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')
              }`}
            >
              <IoIosArrowBack size={20} />
            </button>
            <span className={`text-sm font-medium min-w-[80px] text-center ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {pageNumber} / {numPages || '--'}
            </span>
            <button 
              onClick={goToNextPage} 
              disabled={pageNumber >= numPages}
              className={`p-2 rounded-lg transition-colors ${
                pageNumber >= numPages
                  ? (isDarkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed')
                  : (isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')
              }`}
            >
              <IoIosArrowForward size={20} />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={zoomOut}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FiZoomOut size={16} />
            </button>
            <span className={`text-sm font-medium min-w-[60px] text-center ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={zoomIn}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FiZoomIn size={16} />
            </button>
            <button 
              onClick={resetZoom}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Reset
            </button>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center gap-2">
            <button 
              onClick={rotateClockwise}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
              }`}
              title="Rotate clockwise"
            >
              <FiRotateCw size={16} />
            </button>
            <button 
              onClick={downloadPDF}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
              }`}
              title="Download PDF"
            >
              <FiDownload size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Content */}
      <div className={`flex justify-center p-4 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading PDF...
            </p>
          </div>
        )}
        
        <div className="max-w-full overflow-auto">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
            error={null}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              className="shadow-lg"
            />
          </Document>
        </div>
      </div>

      {/* Mobile-friendly page indicator */}
      <div className={`p-3 text-center border-t ${
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'
      } md:hidden`}>
        <span className="text-sm font-medium">
          Page {pageNumber} of {numPages || '--'}
        </span>
      </div>
    </div>
  );
};

export default PDFViewer;