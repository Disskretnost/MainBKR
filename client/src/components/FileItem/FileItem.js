import React from 'react';
import './FileItem.css';

const FileItem = ({ file, onDownload, onDelete }) => {
  return (
    <div className="file-item">
      <img 
        src="pngwing.com.png" 
        alt="File Icon" 
        className="file-icon"
      />
      
      <p className="file-date">
        {new Date(file.createdAt).toLocaleString()}
      </p>
      
      <div className="files-page__actions">
        <button 
          className="files-page__button files-page__download-button"
          onClick={() => onDownload(file.conferenceId,`${new Date(file.createdAt).toLocaleString()}.docx`)}
          title="Скачать"
        >
          <img 
            src="icons8-download-100.png" 
            alt="Download" 
            className="files-page__image"
          />
        </button>

        <button 
          className="files-page__button files-page__delete-button"
          onClick={() => onDelete(file.conferenceId)}
          title="Удалить"
        >
          <img 
            src="icons8-delete-100.png" 
            alt="Delete" 
            className="files-page__image"
          />
        </button>
      </div>
    </div>
  );
};

export default FileItem;